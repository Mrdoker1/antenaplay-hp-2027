#!/usr/bin/env node
/**
 * Imports the film catalogue from the MovieGuesser project into this one.
 *
 * That project holds 971 films with real metadata — Russian and English titles,
 * year, genres, countries — plus a poster and eight 1280×720 frames each. The
 * AntenaPLAY catalogue carries titles and nothing else, which is why the search
 * could only match words; this gives it something to actually reason over.
 *
 * Posters are downloaded rather than hotlinked: the demo has to work in a room
 * with bad wifi. They are fetched at Kinopoisk's small size and downscaled to
 * 200px, which is twice what any result thumbnail shows.
 *
 * Usage: node scripts/import-film-pool.mjs [path-to-movie-pool.json]
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE =
  process.argv[2] ?? '/Users/viachaskul/Documents/GitHub/MovieGuesser/data/movie-pool.json'
const outDir = join(root, 'src/assets/films')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const pool = JSON.parse(await readFile(SOURCE, 'utf8'))
await mkdir(outDir, { recursive: true })
const have = new Set((await readdir(outDir).catch(() => [])).map((f) => f.replace(/\.[^.]+$/, '')))

const films = []
let saved = 0
let skipped = 0
const failed = []

const limit = 8
let cursor = 0

async function worker() {
  while (cursor < pool.length) {
    const film = pool[cursor++]
    const key = `kp${film.id}`

    if (!have.has(key)) {
      try {
        const res = await fetch(film.posterUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' })
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer())
          if (buf.length > 2048) {
            await writeFile(join(outDir, `${key}.jpg`), buf)
            saved++
          } else failed.push(film.id)
        } else failed.push(film.id)
      } catch {
        failed.push(film.id)
      }
    } else skipped++

    films.push({
      id: key,
      ru: film.titleRu,
      en: film.titleEn,
      year: film.year,
      genres: film.genres ?? [],
      countries: film.countries ?? [],
      // one frame is enough for a 16:9 thumbnail; the rest were for the game
      frame: film.frames?.[0] ?? null,
    })
  }
}

await Promise.all(Array.from({ length: limit }, worker))

films.sort((a, b) => b.year - a.year || a.ru.localeCompare(b.ru))
await writeFile(
  join(root, 'src/data/films.ts'),
  `import type { Film } from './types'\n\n` +
    `/** Film catalogue imported from the MovieGuesser project — see\n` +
    ` *  scripts/import-film-pool.mjs. Posters live in src/assets/films, keyed\n` +
    ` *  by \`id\`. */\n` +
    `export const films: Film[] = ${JSON.stringify(films, null, 1)}\n`,
)

console.log(`${films.length} films; posters saved ${saved}, already present ${skipped}, failed ${failed.length}`)
