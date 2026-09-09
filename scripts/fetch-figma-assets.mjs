#!/usr/bin/env node
/**
 * Pulls every Figma asset the app references into src/assets/img.
 *
 * The Figma desktop app serves the active document's exports on
 * http://localhost:3845/assets/<hash>.<ext>. It only serves the document in the
 * *frontmost tab*, so before running this: open the Antena file (node 1:2) in
 * Figma desktop and make it the active tab. Files already present are skipped.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src/assets/img')
const HOST = 'http://localhost:3845/assets'
const EXTS = ['png', 'svg', 'jpg']

const hashes = new Set()
for (const dir of ['src/data', 'src/components', 'src/v2027']) {
  for (const file of await readdir(join(root, dir))) {
    if (!/\.(ts|tsx)$/.test(file)) continue
    const src = await readFile(join(root, dir, file), 'utf8')
    for (const [, h] of src.matchAll(/['"]([0-9a-f]{40})['"]/g)) hashes.add(h)
  }
}

if (!hashes.size) {
  console.error('No asset hashes found in src/data — nothing to fetch.')
  process.exit(1)
}

await mkdir(outDir, { recursive: true })
const existing = new Set(
  (await readdir(outDir).catch(() => [])).map((f) => f.replace(/\.[^.]+$/, '')),
)

let saved = 0
let skipped = 0
const failed = []

for (const hash of [...hashes].sort()) {
  if (existing.has(hash)) {
    skipped++
    continue
  }
  let done = false
  for (const ext of EXTS) {
    try {
      const res = await fetch(`${HOST}/${hash}.${ext}`)
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (!buf.length) continue
      await writeFile(join(outDir, `${hash}.${ext}`), buf)
      saved++
      done = true
      break
    } catch {
      /* try the next extension */
    }
  }
  if (!done) failed.push(hash)
}

console.log(`saved ${saved}, already present ${skipped}, failed ${failed.length}`)
if (failed.length) {
  console.log(failed.slice(0, 10).join('\n'))
  console.log(
    '\nAll failures usually mean one thing: the Antena file is not the active tab\n' +
      'in the Figma desktop app. Focus it and re-run.',
  )
  process.exitCode = 1
}
