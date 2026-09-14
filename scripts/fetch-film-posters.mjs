/** Replaces the film catalogue's artwork with real posters, in Romanian where
 *  they exist.
 *
 *  The pool imported from MovieGuesser carries a Kinopoisk *frame* — a 340px
 *  still lifted out of the film — and a still is the wrong object: it has no
 *  title on it, no composition meant to be read small, and it crops to
 *  nonsense in a 2:3 card. The taste deck is nothing but posters at 152px
 *  wide, so this matters more there than anywhere else.
 *
 *  TMDB has the poster, and has it localised. `include_image_language=ro,en,null`
 *  asks for the Romanian key art first, the English second, and the
 *  textless original last — so a Romanian viewer sees Romanian artwork
 *  wherever the distributor made any. The localised title comes back from the
 *  same lookup and is worth as much: "Odiseea", not "The Odyssey".
 *
 *  Run with the token in the environment — it is not stored in this repo:
 *
 *    TMDB_ACCESS_TOKEN=… node scripts/fetch-film-posters.mjs
 *
 *  Writes src/assets/films/<kinopoisk id>.jpg and prints a JSON map of
 *  Romanian titles for src/data/films.ts. */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const TOKEN = process.env.TMDB_ACCESS_TOKEN
if (!TOKEN) {
  console.error('TMDB_ACCESS_TOKEN is not set')
  process.exit(1)
}

const OUT = new URL('../src/assets/films/', import.meta.url)
const TITLES = new URL('../src/data/film-titles.json', import.meta.url)
/** 500px wide is 2× the largest a card is ever drawn, and ~60 KB a file. */
const SIZE = 'w500'
const CONCURRENCY = 8
const CYRILLIC = /[Ѐ-ӿ]/

const api = async (path, params) => {
  const url = new URL(`https://api.themoviedb.org/3${path}`)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (res.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${path}`)
    return res.json()
  }
}

const fold = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase()

/** The search returns anything that shares a word, so the year is the guard:
 *  without it "Prey" alone matches a dozen films and the deck fills with
 *  posters for the wrong ones. */
function bestMatch(results, title, year) {
  const want = fold(title)
  const scored = results
    .filter((r) => r.poster_path)
    .map((r) => {
      const y = Number((r.release_date ?? '').slice(0, 4))
      const exact = fold(r.original_title) === want || fold(r.title) === want
      const off = year && y ? Math.abs(y - year) : 9
      return { r, score: (exact ? 100 : 0) - off * 6 + Math.min(r.popularity ?? 0, 40) / 10 }
    })
    .sort((a, b) => b.score - a.score)
  const top = scored[0]
  return top && top.score > 0 ? top.r : null
}

/** Romanian key art if the distributor made any, English if not, and the
 *  textless original as the last resort — never a frame. */
function bestPoster(images) {
  const posters = images.posters ?? []
  const rank = (p) => (p.iso_639_1 === 'ro' ? 3 : p.iso_639_1 === 'en' ? 2 : p.iso_639_1 ? 0 : 1)
  return posters
    .slice()
    .sort((a, b) => rank(b) - rank(a) || (b.vote_average ?? 0) - (a.vote_average ?? 0))[0]
}

const source = await readFile(new URL('../src/data/films.ts', import.meta.url), 'utf8')
const films = JSON.parse(source.slice(source.indexOf('= [') + 2, source.lastIndexOf(']') + 1))
const wanted = films.filter((f) => f.en && !CYRILLIC.test(f.en))

await mkdir(OUT, { recursive: true })

const titles = existsSync(TITLES) ? JSON.parse(await readFile(TITLES, 'utf8')) : {}
const force = process.argv.includes('--force')
let done = 0
let ok = 0
let missed = 0
const gaps = []

async function one(film) {
  const file = new URL(`${film.id}.jpg`, OUT)
  try {
    const found = await api('/search/movie', {
      query: film.en,
      language: 'ro-RO',
      include_adult: 'false',
      ...(film.year ? { year: String(film.year) } : {}),
    })
    let match = bestMatch(found.results ?? [], film.en, film.year)
    // a year that is one off in one of the two catalogues is common enough to
    // be worth a second, unconstrained pass before giving up
    if (!match && film.year) {
      const wide = await api('/search/movie', { query: film.en, language: 'ro-RO' })
      match = bestMatch(wide.results ?? [], film.en, film.year)
    }
    if (!match) {
      missed++
      gaps.push(`${film.id} ${film.en}`)
      return
    }

    const images = await api(`/movie/${match.id}/images`, { include_image_language: 'ro,en,null' })
    const poster = bestPoster(images) ?? { file_path: match.poster_path, iso_639_1: null }
    const res = await fetch(`https://image.tmdb.org/t/p/${SIZE}${poster.file_path}`)
    if (!res.ok) throw new Error(`image ${res.status}`)
    await writeFile(file, Buffer.from(await res.arrayBuffer()))

    // Only a genuinely localised title is worth keeping: TMDB echoes the
    // original back when there is no Romanian one, and storing that just
    // duplicates what the catalogue already has.
    if (match.title && match.title !== match.original_title && !CYRILLIC.test(match.title)) {
      titles[film.id] = match.title
    }
    ok++
  } catch (err) {
    missed++
    gaps.push(`${film.id} ${film.en} — ${err.message}`)
  } finally {
    done++
    if (done % 25 === 0) process.stdout.write(`  ${done}/${wanted.length}  ok ${ok}  missed ${missed}\n`)
  }
}

const queue = wanted.filter((f) => force || !existsSync(new URL(`${f.id}.jpg`, OUT)) || true)
console.log(`${queue.length} films, ${CONCURRENCY} at a time`)

let cursor = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < queue.length) await one(queue[cursor++])
  }),
)

await writeFile(TITLES, `${JSON.stringify(titles, null, 1)}\n`)
console.log(`\nposters: ${ok}   no match: ${missed}   romanian titles: ${Object.keys(titles).length}`)
if (gaps.length) console.log('\nno poster for:\n' + gaps.slice(0, 40).join('\n'))
