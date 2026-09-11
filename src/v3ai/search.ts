/** The catalogue search behind the AI panel.
 *
 *  The point of the feature is that you describe what you are in the mood for
 *  rather than type a title, so this has to actually answer — a panel that only
 *  looks clever is worse than no panel. It runs entirely locally over the real
 *  catalogue in src/data: tokenise the phrase, drop the filler words, match
 *  tokens against titles and against a tag vocabulary derived from each title
 *  and the rail it sits in, then rank.
 *
 *  It is a lexical matcher with a hand-built Romanian/English vocabulary, not a
 *  language model. That is the honest shape of a prototype: the interaction, the
 *  latency and the result surface are real, and the ranking is good enough to
 *  demo with — swapping in an embedding call later changes this file only. */

import { canaleGratuite, canaleTv } from '../data/channels'
import { liveEvents } from '../data/liveEvents'
import {
  asiaAmerica,
  filmeSerialeNoi,
  inCurand,
  insulaRomania,
  insulaTakeover,
  powerCouple,
  sport,
  top10,
  topFilme,
  topSeriale,
  topShowuri,
  trending,
} from '../data/posters'
import type { Poster } from '../data/types'

export type Hit = {
  title: string
  cover: string | null
  /** the one-line descriptor shown under the title in the results list */
  vibe: string
  tags: string[]
  score: number
}

/* ── vocabulary ───────────────────────────────────────────────────────────
   Each tag lists the words a viewer might reach for, in Romanian and English.
   Kept flat and readable on purpose: this is the part a native speaker will
   want to edit, and it should not require touching the scorer to do it.      */
const VOCAB: Record<string, string[]> = {
  romance: ['dragoste', 'iubire', 'iubirii', 'romantic', 'romantica', 'love', 'romance', 'pasiune'],
  reality: ['reality', 'cupluri', 'cuplu', 'concurenti', 'insula', 'mireasa', 'chefi', 'show'],
  adventure: ['aventura', 'aventuri', 'calatorie', 'travel', 'express', 'drum', 'drumul'],
  sport: ['sport', 'fotbal', 'football', 'formula', 'f1', 'uefa', 'tenis', 'hochei', 'nhl', 'mondial', 'cup', 'campionat'],
  film: ['film', 'filme', 'movie', 'movies', 'lungmetraj'],
  series: ['serial', 'seriale', 'sezon', 'sezonul', 'series', 'season', 'episod'],
  comedy: ['comedie', 'comedy', 'umor', 'iumor', 'funny', 'ras', 'amuzant', 'haios'],
  thriller: ['thriller', 'actiune', 'action', 'crima', 'crime', 'suspans', 'politist', 'detectiv'],
  drama: ['drama', 'dramatic', 'dramatica', 'dramatice', 'emotionant', 'profund'],
  doc: ['documentar', 'documentary', 'jurnal', 'interviu', 'interviurile', 'making'],
  short: ['scurt', 'scurte', 'clip', 'clipuri', 'momente', 'nedifuzate', 'short', 'rapid'],
  fresh: ['nou', 'noi', 'noua', 'new', 'recent', 'proaspat', 'curand'],
  turkish: ['turc', 'turcesc', 'turceasca', 'turcesti', 'istanbul', 'turkish'],
  live: ['live', 'direct', 'acum', 'tonight', 'seara', 'diseara'],
  channel: ['canal', 'canale', 'channel', 'post'],
  free: ['gratuit', 'gratuite', 'free', 'gratis'],
}

/** Words that carry no signal in a phrase like "ceva scurt si amuzant". */
const STOP = new Set([
  'ceva','cu','si','sau','de','la','in','pe','un','o','al','ale','care','vreau','caut','arata','gaseste',
  'mi','as','vrea','sa','vad','ma','uit','despre','pentru','din','mai','foarte','cel','cea','este','e',
  'a','the','and','or','of','with','for','me','i','want','something','find','show','watch','some','to','is',
])

const fold = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .toLowerCase()

/* ── tagging ──────────────────────────────────────────────────────────────── */

/** Tags implied by the rail an item sits in — context the title alone lacks. */
const RAIL_TAGS: Record<string, string[]> = {
  trending: ['fresh'],
  inCurand: ['fresh'],
  topFilme: ['film'],
  filmeSerialeNoi: ['film', 'series', 'fresh'],
  topSeriale: ['series'],
  topShowuri: ['reality'],
  insulaRomania: ['reality', 'romance'],
  insulaTakeover: ['reality', 'romance'],
  asiaAmerica: ['reality', 'adventure'],
  powerCouple: ['reality', 'romance'],
  sport: ['sport'],
  top10: [],
}

function titleTags(title: string): string[] {
  const t = fold(title)
  const out = new Set<string>()
  for (const [tag, words] of Object.entries(VOCAB)) {
    if (words.some((w) => t.includes(w))) out.add(tag)
  }
  if (/sezonul\s*\d+/.test(t)) out.add('series')
  return [...out]
}

const VIBE: [string, string][] = [
  ['sport', 'Sport în direct'],
  ['romance', 'Dragoste și tensiune'],
  ['adventure', 'Aventură pe drum'],
  ['reality', 'Reality românesc'],
  ['comedy', 'Comedie'],
  ['thriller', 'Thriller cu suspans'],
  ['doc', 'Din spatele camerei'],
  ['short', 'Moment scurt'],
  ['turkish', 'Dramă turcească'],
  ['series', 'Serial'],
  ['film', 'Film'],
]

function vibeFor(tags: string[]): string {
  for (const [tag, label] of VIBE) if (tags.includes(tag)) return label
  return 'Din catalog'
}

/* ── the index ────────────────────────────────────────────────────────────── */

type Kind = 'title' | 'channel' | 'event'

type Entry = {
  title: string
  cover: string | null
  tags: string[]
  folded: string
  vibe: string
  kind: Kind
}

const RAILS: [string, Poster[]][] = [
  ['trending', trending],
  ['inCurand', inCurand],
  ['topFilme', topFilme],
  ['filmeSerialeNoi', filmeSerialeNoi],
  ['topSeriale', topSeriale],
  ['topShowuri', topShowuri],
  ['insulaRomania', insulaRomania],
  ['insulaTakeover', insulaTakeover],
  ['asiaAmerica', asiaAmerica],
  ['powerCouple', powerCouple],
  ['sport', sport],
  ['top10', top10],
]

function buildIndex(): Entry[] {
  const byTitle = new Map<string, Entry>()

  const add = (title: string, cover: string | null, tags: string[], kind: Kind) => {
    if (!title) return
    const existing = byTitle.get(title)
    if (existing) {
      for (const t of tags) if (!existing.tags.includes(t)) existing.tags.push(t)
      // a real poster beats a 16:9 still for the results list
      if (!existing.cover && cover) existing.cover = cover
      // a title that is also programming outranks a bare channel entry
      if (existing.kind === 'channel' && kind !== 'channel') existing.kind = kind
      existing.vibe = vibeFor(existing.tags)
      return
    }
    const all = [...new Set([...titleTags(title), ...tags])]
    byTitle.set(title, { title, cover, tags: all, folded: fold(title), vibe: vibeFor(all), kind })
  }

  for (const [rail, items] of RAILS) {
    for (const item of items) add(item.name, item.cover ?? null, RAIL_TAGS[rail] ?? [], 'title')
  }
  for (const c of canaleTv) add(c.name, c.logo, ['channel', 'live'], 'channel')
  for (const c of canaleGratuite) add(c.name, c.logo, ['channel', 'live', 'free'], 'channel')
  for (const e of liveEvents) add(e.title, e.still ?? null, ['sport', 'live'], 'event')

  return [...byTitle.values()]
}

const INDEX = buildIndex()

/** Tag weights, inverse to how common the tag is. Without this, "reality" —
 *  which half the catalogue carries — counts as much as "turkish", which two
 *  titles carry, and a broad phrase returns whatever happens to sort first. */
const TAG_WEIGHT: Record<string, number> = (() => {
  const df: Record<string, number> = {}
  for (const e of INDEX) for (const t of e.tags) df[t] = (df[t] ?? 0) + 1
  const out: Record<string, number> = {}
  for (const [tag, n] of Object.entries(df)) {
    out[tag] = 1.6 + Math.log(INDEX.length / Math.max(n, 1))
  }
  return out
})()

/* ── querying ─────────────────────────────────────────────────────────────── */

/** Whether a typed token means the same thing as a vocabulary word.
 *
 *  Romanian inflects heavily — "sezon/sezonul", "film/filme", "aventura/
 *  aventuri" — so a prefix rule is needed. But an unguarded one is worse than
 *  none: "cupluri" prefix-matched "cup" and pulled the whole World Cup shelf
 *  into a query about couples. Hence the length floors and the cap on how much
 *  of a suffix an inflection may add. */
function related(token: string, word: string): boolean {
  if (token === word) return true
  if (token.length >= 4 && word.startsWith(token) && word.length - token.length <= 5) return true
  if (word.length >= 4 && token.startsWith(word) && token.length - word.length <= 5) return true
  return false
}

export type Parsed = { tokens: string[]; tags: string[] }

export function parse(query: string): Parsed {
  const tokens = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))

  const tags = new Set<string>()
  for (const [tag, words] of Object.entries(VOCAB)) {
    if (tokens.some((tok) => words.some((w) => related(tok, w)))) tags.add(tag)
  }
  return { tokens, tags: [...tags] }
}

export function search(query: string, limit = 6): Hit[] {
  const { tokens, tags } = parse(query)
  if (!tokens.length) return []

  const hits: Hit[] = []
  for (const entry of INDEX) {
    let score = 0

    for (const tok of tokens) {
      if (tok.length < 3) continue
      if (entry.folded.includes(tok)) score += entry.folded.startsWith(tok) ? 8 : 6
    }
    for (const tag of tags) if (entry.tags.includes(tag)) score += TAG_WEIGHT[tag] ?? 2

    // A channel is an answer to "what can I watch on", not to "a film with".
    // Without this, "film de acțiune" returns the FilmBox channels, because
    // their names contain the word.
    const wantsChannel = tags.includes('channel') || tags.includes('free')
    if (entry.kind === 'channel' && !wantsChannel) score *= 0.35

    if (!score) continue
    // every matched tag beyond the first means the phrase was understood as a
    // whole rather than on one lucky word
    if (tags.length > 1) {
      const covered = tags.filter((t) => entry.tags.includes(t)).length
      score += covered === tags.length ? 4 : 0
    }
    if (entry.cover) score += 0.5

    hits.push({ title: entry.title, cover: entry.cover, vibe: entry.vibe, tags: entry.tags, score })
  }

  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        // then prefer something we can actually show, then the shorter title,
        // which is usually the canonical one rather than a spin-off
        Number(!!b.cover) - Number(!!a.cover) ||
        a.title.length - b.title.length ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit)
}

/** Total matches, so the panel can offer "show the other N". */
export function countMatches(query: string): number {
  const { tokens, tags } = parse(query)
  if (!tokens.length) return 0
  return INDEX.filter(
    (e) =>
      tokens.some((t) => t.length >= 3 && e.folded.includes(t)) ||
      tags.some((t) => e.tags.includes(t)),
  ).length
}

/** Example phrases, shown as chips. Each one returns results. */
export const SUGGESTIONS = [
  'ceva scurt și amuzant',
  'reality cu cupluri',
  'sport în direct',
  'dramă turcească',
  'aventură pe drum',
]
