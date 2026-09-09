/** Presentation metadata for the 2027 skin.
 *
 *  Titles, badges and artwork hashes all come from the real Figma content in
 *  src/data. What is added here is the metadata layer the redesign needs but
 *  the old page never had, because it burnt titles into the artwork instead:
 *  a kind (which decides the card's aspect ratio), a badge token, and a short
 *  meta line. Values are derived from the title text where the title says so
 *  ("Sezonul 10", "Formula 1") and are otherwise plausible mockup copy — this
 *  is a design proposal, not a catalogue feed. */

import { canaleGratuite, canaleTv } from '../data/channels'
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
import type { Channel, Poster } from '../data/types'

export type BadgeKind = 'live' | 'new' | 'free' | 'soon' | null

export type Item = {
  title: string
  cover: string | null
  /** The title lockup Figma ships alongside the cover. Unused by default —
   *  titles live in the UI layer — and read only by the Top 10 rail, which the
   *  source design sets as poster art with the lockup on it. */
  logo?: string | null
  /** 'title' → 2:3 poster. Every browsable row uses it, including the sport
   *  shelf and Continue watching, because the artwork is portrait and the row
   *  system is built around it.
   *
   *  'wide' → 16:9, reserved for a schedule: "Live & Sport" and the channel
   *  tiles, where the frame stands for a moment in time rather than a title.
   *  Genre does not decide this — "AntenaPLAY Sport" is a shelf and reads as
   *  posters, while "Live & Sport" is a timetable and reads as frames. */
  shape: 'title' | 'wide'
  badge: BadgeKind
  meta: string
  /** 0–1, drives the resume bar on Continue watching */
  progress?: number
}

const RESUME = ['S10 E14', 'S2 E6', 'Reia filmul', 'S3 E2', 'S1 E9', 'S10 E21', 'S4 E3', 'S2 E11']

const SPORT = /formula|uefa|nations league|endurance|tenis|wtt|sport/i
const SHOW = /sezonul|insula|asia express|america express|fiertzi|furnicu|jurnal|podcastito|interviurile|extra|power couple|mireasa|chefi/i

function season(title: string): string | null {
  const m = title.match(/sezonul\s+(\d+)/i)
  return m ? `S${m[1]}` : null
}

function metaFor(title: string, shape: Item['shape']): string {
  const bits: string[] = []
  const s = season(title)
  if (s) bits.push(s)
  if (SPORT.test(title)) bits.push(shape === 'wide' ? 'Live sport' : 'Sport', '2026')
  else if (shape === 'wide') bits.push('Clip', '4 min')
  else if (SHOW.test(title)) bits.push('Reality', '2026')
  else bits.push('Film', '2025')
  return bits.join('  ·  ')
}

/** Companion content: interviews, travel diaries, "Extra", "Making Of",
 *  "Imagini nedifuzate la TV". Real titles from across the catalogue, deduped,
 *  in the order the rails list them. */
const EXTRA =
  /nedifuzate|interviurile|jurnal de c|jurnal de calatorie|extra\b|podcastito|making of|express talk|fiertzi/i

/** A cover that came out of Figma is a real 537×906 key-art poster. Anything
 *  else is a 16:9 still fetched from AntenaPLAY, which survives a 16:9 card but
 *  gets butchered by a 2:3 crop. */
const hasPortraitPoster = (item: Poster) => !!item.cover && /^[0-9a-f]{40}$/.test(item.cover)

/** What to put in Continue watching.
 *
 *  Two constraints, both learned the hard way. It must not repeat the head of
 *  Trending — the first version took Trending's first eight and the two rows
 *  showed the same posters, which reads as a bug. And every card must have a
 *  real portrait poster: the second version walked the rails' tails, which is
 *  exactly where the 16:9 stills live, so the row filled up with hard-cropped
 *  frames. "În curând" is left out too — a resume row should not offer to
 *  continue something that has not aired.
 *
 *  Deterministic, so the row does not reshuffle between loads. */
function resumePicks(count: number): Poster[] {
  const shown = new Set(trending.slice(0, 10).map((i) => i.name))
  const pools = [filmeSerialeNoi, topSeriale, topFilme, trending, insulaRomania, asiaAmerica].map(
    (rail) => rail.filter((i) => i.name && hasPortraitPoster(i) && !shown.has(i.name)),
  )

  const seen = new Set<string>()
  const out: Poster[] = []
  for (let depth = 0; out.length < count && depth < 20; depth++) {
    for (const pool of pools) {
      const item = pool[depth]
      if (!item || seen.has(item.name) || out.length >= count) continue
      seen.add(item.name)
      out.push(item)
    }
  }
  return out
}

function extras(): Poster[] {
  const seen = new Set<string>()
  const out: Poster[] = []
  for (const rail of [trending, insulaRomania, asiaAmerica, powerCouple, sport]) {
    for (const item of rail) {
      if (!item.name || !item.cover || seen.has(item.name)) continue
      if (!EXTRA.test(item.name)) continue
      seen.add(item.name)
      out.push(item)
    }
  }
  return out
}

/** A rail is one content type, so its shape is set per rail, not per card. */
function asShape(items: Poster[], shape: Item['shape'], badge: BadgeKind = null): Item[] {
  return items.map((p) => {
    const title = p.name || ''
    return { title, cover: p.cover, logo: p.logo ?? null, shape, badge, meta: metaFor(title, shape) }
  })
}

export const rows = {
  continueWatching: asShape(resumePicks(8), 'title').map((item, i) => {
    const progress = [0.62, 0.18, 0.87, 0.34, 0.51, 0.09, 0.73, 0.44][i]
    const left = [16, 38, 6, 31, 24, 43, 12, 27][i]
    return {
      ...item,
      badge: null as BadgeKind,
      progress,
      meta: `${RESUME[i % RESUME.length]}  ·  ${left} min rămase`,
    }
  }),
  // no SOON badge here: the source key art already has a yellow date sticker
  // burnt into it, and two badges on one card is worse than none. Clean art is
  // a prerequisite for the badge system to carry this rail.
  inCurand: asShape(inCurand, 'title'),
  trending: asShape(trending, 'title'),
  asiaAmerica: asShape(asiaAmerica, 'title'),
  insulaRomania: asShape(insulaRomania, 'title'),
  // Extras: the behind-the-scenes, interview and travel-diary titles the
  // catalogue is full of. Sourced by matching real titles rather than by
  // reslicing another rail, so the row stops repeating Trending's cards.
  extras: asShape(extras(), 'title', 'new'),
  top10: asShape(top10, 'title'),
  topFilme: asShape(topFilme, 'title'),
  topSeriale: asShape(topSeriale, 'title'),
  topShowuri: asShape(topShowuri, 'title'),
  filmeSerialeNoi: asShape(filmeSerialeNoi, 'title'),
  sport: asShape(sport, 'title'),
  powerCouple: asShape(powerCouple, 'title'),
  insulaTakeover: asShape(insulaTakeover, 'title'),
}

export type ChannelItem = Omit<Channel, 'badge'> & { now: string; badge: BadgeKind }

/** Channels stop being a wall of logos: each tile is what is on air right now,
 *  with the logo as an overlay rather than the whole tile. */
function toChannel(channel: Channel, nowPool: string[], i: number): ChannelItem {
  const badge: BadgeKind =
    channel.badge === 'Gratuit' ? 'free' : channel.badge === 'Live' ? 'live' : null
  return {
    ...channel,
    now: badge === 'live' ? 'În direct acum' : nowPool[i % nowPool.length],
    badge,
  }
}

const NOW_TV = [
  'Observator · 19:00',
  'Insula Iubirii · S10 E14',
  'Asia Express · Drumul Mătăsii',
  'Chefi la cuțite · S13 E8',
  'Mireasa · sezon 12',
  'În direct acum',
]
const NOW_FREE = ['Non-stop', 'Maraton', 'Episoade complete', 'În reluare']

export const channelsTv: ChannelItem[] = canaleTv.map((c, i) => toChannel(c, NOW_TV, i))
export const channelsFree: ChannelItem[] = canaleGratuite.map((c, i) => toChannel(c, NOW_FREE, i))
