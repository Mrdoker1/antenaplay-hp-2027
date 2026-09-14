#!/usr/bin/env node
/**
 * Replaces the film posters with stills from the films themselves.
 *
 * The Kinopoisk posters are Russian-market artwork — «ОДИССЕЯ», «МАЛЬЧИК И
 * ПТИЦА» — which is wrong on a Romanian surface. The pool also carries eight
 * 1280×720 frames per film, and a frame has no title text on it at all, so it
 * sidesteps the language question entirely. It is also the right shape: every
 * place these appear is a 16:9 thumbnail.
 *
 * Only films with a latin title are fetched, since those are the only ones the
 * search indexes.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src/assets/films')
const CYRILLIC = /[Ѐ-ӿ]/
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const src = await readFile(join(root, 'src/data/films.ts'), 'utf8')
// the first "[" in the file belongs to the `Film[]` annotation, not the data
const films = JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1))
const wanted = films.filter((f) => f.en && !CYRILLIC.test(f.en))

await mkdir(outDir, { recursive: true })
const existing = new Set(await readdir(outDir).catch(() => []))
const keep = new Set(wanted.map((f) => `${f.id}.jpg`))

// drop posters for everything the search will never surface
let removed = 0
for (const file of existing) {
  if (!keep.has(file)) {
    await unlink(join(outDir, file))
    removed++
  }
}

let saved = 0
const missing = []
let cursor = 0

async function worker() {
  while (cursor < wanted.length) {
    const film = wanted[cursor++]
    if (!film.frame) {
      missing.push(`${film.id} ${film.en}`)
      continue
    }
    try {
      const res = await fetch(film.frame, { headers: { 'User-Agent': UA }, redirect: 'follow' })
      if (!res.ok) {
        missing.push(`${film.id} ${film.en} (${res.status})`)
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 4096) {
        missing.push(`${film.id} ${film.en} (tiny)`)
        continue
      }
      await writeFile(join(outDir, `${film.id}.jpg`), buf)
      saved++
    } catch {
      missing.push(`${film.id} ${film.en} (error)`)
    }
  }
}

await Promise.all(Array.from({ length: 10 }, worker))
console.log(`${wanted.length} latin-titled films; stills saved ${saved}, removed ${removed} posters, missing ${missing.length}`)
if (missing.length) console.log(missing.slice(0, 10).join('\n'))
