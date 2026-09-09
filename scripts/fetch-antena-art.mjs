#!/usr/bin/env node
/**
 * Fills in artwork for cards the Figma capture left as placeholders.
 *
 * Source is AntenaPLAY's own site: the Figma file was captured from the live
 * page mid-lazy-load, so these covers exist — they just never rendered. Each
 * show page carries an og:image, which is the canonical still for that title.
 * Slugs follow the site's own rule (lowercase, diacritics stripped, non-alnum
 * collapsed to "-"), verified against the slugs the site itself links to.
 *
 * Writes src/assets/web/<slug>.<ext> and prints the titles it could not match.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src/assets/web')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

export function slugify(title) {
  return title
    // strip these BEFORE normalising: NFKD expands ™ to "TM", which would
    // otherwise end up in the slug as "...-cuptm"
    .replace(/[™®©]/g, '')
    .replace(/[\u2010-\u2015]/g, '-') // non-breaking and figure dashes
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // combining marks: ă â î ș ț é
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Slugs the site spells its own way, found by probing. */
const OVERRIDES = {
  'The Ex\u2011Wife': 'the-exwife',
}

/** Slug variants worth trying: the site shortens some titles and expands others. */
function candidates(title) {
  const base = slugify(title)
  const out = new Set([base])
  if (OVERRIDES[title]) return [OVERRIDES[title]]
  // "Insula Iubirii PLUS | Imagini nedifuzate la TV" -> insula-iubirii-plus
  const beforePipe = title.split('|')[0].trim()
  if (beforePipe && beforePipe !== title) out.add(slugify(beforePipe))
  // "Fiertzi pe Insula | Sezonul 3" -> fiertzi-pe-insula-iubirii-sezonul-3
  out.add(base.replace('-insula-', '-insula-iubirii-'))
  // drop a trailing season qualifier entirely
  out.add(base.replace(/-sezonul-\d+$/, ''))
  return [...out].filter(Boolean)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ogImage(slug) {
  const res = await fetch(`https://antenaplay.ro/${slug}`, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
  })
  if (!res.ok) return null
  const html = await res.text()
  const m =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)
  return m ? m[1] : null
}

// ── the titles that still need artwork ─────────────────────────────────────
const posters = await readFile(join(root, 'src/data/posters.ts'), 'utf8')
const rails = [...posters.matchAll(/export const \w+: Poster\[\] = (\[[\s\S]*?\n\])/g)].map((m) =>
  JSON.parse(m[1]),
)
const have = new Set()
const need = new Set()
for (const items of rails) {
  for (const it of items) {
    if (!it.name) continue
    if (it.cover && it.cover !== PLACEHOLDER) have.add(it.name)
  }
}
for (const items of rails) {
  for (const it of items) {
    if (!it.name) continue
    const missing = !it.cover || it.cover === PLACEHOLDER
    if (missing && !have.has(it.name)) need.add(it.name)
  }
}

await mkdir(outDir, { recursive: true })
const already = new Set(
  (await readdir(outDir).catch(() => [])).map((f) => f.replace(/\.[^.]+$/, '')),
)

const map = {}
const misses = []
const titles = [...need].sort()
console.log(`${titles.length} titles need artwork`)

for (const [i, title] of titles.entries()) {
  let done = false
  for (const slug of candidates(title)) {
    if (already.has(slug)) {
      map[title] = slug
      done = true
      break
    }
    let url
    try {
      url = await ogImage(slug)
    } catch {
      /* try the next candidate */
    }
    if (!url) {
      await sleep(120)
      continue
    }
    try {
      const img = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!img.ok) continue
      const buf = Buffer.from(await img.arrayBuffer())
      if (buf.length < 4096) continue
      const ext = (url.match(/\.(jpe?g|png|webp)(?:\?|$)/i)?.[1] ?? 'jpg').toLowerCase()
      await writeFile(join(outDir, `${slug}.${ext}`), buf)
      map[title] = slug
      done = true
      console.log(`  ${String(i + 1).padStart(3)}  ${title}  ->  ${slug}.${ext}`)
      break
    } catch {
      /* try the next candidate */
    }
  }
  if (!done) misses.push(title)
  await sleep(150)
}

await writeFile(join(root, 'scripts/antena-art-map.json'), JSON.stringify(map, null, 1) + '\n')
console.log(`\nmatched ${Object.keys(map).length}/${titles.length}; ${misses.length} not found`)
if (misses.length) console.log(misses.map((t) => '  - ' + t).join('\n'))
