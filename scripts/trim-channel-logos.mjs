/** Trim the transparent border off every channel mark.
 *
 *  All 78 channel logos arrive as square images with the wordmark floating in
 *  the middle of a lot of nothing — often less than half the height. Wherever
 *  the UI shows one, `object-contain` fits the *image*, so the mark renders at
 *  a fraction of its box and looks lost. Cropping to the ink makes every box
 *  in the app hold a mark as large as it says it is.
 *
 *  No dependency: a PNG is a zlib stream of filtered scanlines, which is little
 *  enough to read and write by hand, and this runs once rather than at build
 *  time. Non-RGBA files and ones with no transparent border are left alone.
 *
 *    node scripts/trim-channel-logos.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync, inflateSync } from 'node:zlib'

const ROOT = new URL('..', import.meta.url).pathname
const DRY = process.argv.includes('--dry')

const CRC = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return (buf) => {
    let c = -1
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8)
    return (c ^ -1) >>> 0
  }
})()

function chunks(buf) {
  const out = []
  let pos = 8
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    out.push({ type: buf.toString('ascii', pos + 4, pos + 8), data: buf.subarray(pos + 8, pos + 8 + len) })
    pos += 12 + len
  }
  return out
}

const paeth = (a, b, c) => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

/** undo the per-scanline filters; returns one flat RGBA buffer */
function unfilter(raw, width, height, bpp) {
  const stride = width * bpp
  const out = Buffer.alloc(stride * height)
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]
    const line = raw.subarray(pos, pos + stride)
    pos += stride
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0
      const b = prev[x]
      const c = x >= bpp ? prev[x - bpp] : 0
      const v = line[x]
      cur[x] =
        filter === 0 ? v
        : filter === 1 ? (v + a) & 255
        : filter === 2 ? (v + b) & 255
        : filter === 3 ? (v + ((a + b) >> 1)) & 255
        : (v + paeth(a, b, c)) & 255
    }
  }
  return out
}

function encode(pixels, width, height, bpp) {
  const stride = width * bpp
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = bpp === 4 ? 6 : 2
  const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]
  for (const [type, data] of [['IHDR', ihdr], ['IDAT', deflateSync(raw, { level: 9 })], ['IEND', Buffer.alloc(0)]]) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(CRC(body))
    parts.push(len, body, crc)
  }
  return Buffer.concat(parts)
}

const source = readFileSync(join(ROOT, 'src/data/channels.ts'), 'utf8')
const keys = [...new Set([...source.matchAll(/"logo":\s*"([0-9a-f]{40})"/g)].map((m) => m[1]))]

let trimmed = 0
let skipped = 0
for (const key of keys) {
  const path = join(ROOT, 'src/assets/img', `${key}.png`)
  let buf
  try {
    buf = readFileSync(path)
  } catch {
    skipped++
    continue
  }
  const parsed = chunks(buf)
  const ihdr = parsed.find((c) => c.type === 'IHDR')
  const width = ihdr.data.readUInt32BE(0)
  const height = ihdr.data.readUInt32BE(4)
  const depth = ihdr.data[8]
  const colour = ihdr.data[9]
  if (depth !== 8 || colour !== 6) {
    skipped++
    continue
  }

  const raw = inflateSync(Buffer.concat(parsed.filter((c) => c.type === 'IDAT').map((c) => c.data)))
  const px = unfilter(raw, width, height, 4)

  // the ink box: anything that is not all but invisible
  let x0 = width
  let y0 = height
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (px[(y * width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) {
    skipped++
    continue
  }

  // a hair of margin, so a mark with a hard edge does not sit flush
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02)
  x0 = Math.max(0, x0 - pad)
  y0 = Math.max(0, y0 - pad)
  x1 = Math.min(width - 1, x1 + pad)
  y1 = Math.min(height - 1, y1 + pad)

  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  if (w === width && h === height) {
    skipped++
    continue
  }

  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    px.copy(out, y * w * 4, ((y0 + y) * width + x0) * 4, ((y0 + y) * width + x0 + w) * 4)
  }
  if (!DRY) writeFileSync(path, encode(out, w, h, 4))
  trimmed++
  if (trimmed <= 6) console.log(`${key.slice(0, 8)}  ${width}×${height} → ${w}×${h}`)
}

console.log(`${DRY ? 'would trim' : 'trimmed'} ${trimmed}, left alone ${skipped}, of ${keys.length}`)
