/** Colour feeding — the accent that drives the page background.
 *
 *  With key art present the accent is sampled from the artwork, so the page
 *  genuinely takes its mood from whatever is in focus. Without it (art not yet
 *  exported) the accent is derived from the title, deterministically, so the
 *  behaviour is still demonstrable and a given show always feeds the same
 *  colour. */

export type Accent = { a1: string; a2: string }

const cache = new Map<string, Accent>()

/** The accent for artwork that has already been sampled, or null if it has not
 *  been. Lets the feed commit a known colour immediately instead of showing a
 *  placeholder hue and correcting it a frame later. */
export function sampledAccent(src: string): Accent | null {
  return cache.get(src) ?? null
}

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Deterministic stand-in: spread hues around the wheel, keep them dark and
 *  saturated enough to read as a wash rather than as a colour block. */
export function accentFromTitle(title: string): Accent {
  const h = hash(title || 'antena')
  const hue = h % 360
  const hue2 = (hue + 26 + (h % 40)) % 360
  return {
    a1: `${hue} 62% 34%`,
    a2: `${hue2} 55% 26%`,
  }
}

/** Average the artwork down to one dominant hue, biased toward saturated
 *  pixels so a mostly-grey poster still yields the one colour that matters. */
export async function accentFromImage(src: string, title: string): Promise<Accent> {
  const hit = cache.get(src)
  if (hit) return hit

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    await img.decode()

    const size = 24
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return accentFromTitle(title)
    ctx.drawImage(img, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    let r = 0
    let g = 0
    let b = 0
    let weight = 0
    for (let i = 0; i < data.length; i += 4) {
      const [pr, pg, pb] = [data[i], data[i + 1], data[i + 2]]
      const max = Math.max(pr, pg, pb)
      const min = Math.min(pr, pg, pb)
      // saturated, mid-luminance pixels say the most about a poster
      const w = (max - min) / 255 + 0.12
      r += pr * w
      g += pg * w
      b += pb * w
      weight += w
    }
    if (!weight) return accentFromTitle(title)

    const accent = toAccent(r / weight, g / weight, b / weight)
    cache.set(src, accent)
    return accent
  } catch {
    return accentFromTitle(title)
  }
}

function toAccent(r: number, g: number, b: number): Accent {
  const [h, s] = rgbToHs(r, g, b)
  const hue = Math.round(h)
  const sat = Math.round(Math.min(72, Math.max(38, s)))
  return {
    a1: `${hue} ${sat}% 34%`,
    a2: `${(hue + 30) % 360} ${Math.round(sat * 0.85)}% 26%`,
  }
}

function rgbToHs(r: number, g: number, b: number): [number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  const l = (max + min) / 2
  if (!d) return [0, 0]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return [((h * 60) + 360) % 360, s * 100]
}
