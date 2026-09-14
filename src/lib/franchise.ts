import { rows } from '../v2027/catalog'
import type { Item } from '../v2027/catalog'

/** Franchises, assembled from the catalogue.
 *
 *  The single most under-used thing AntenaPLAY owns is depth. "Insula Iubirii"
 *  is not a show — it is ten Romanian seasons, seven international editions and
 *  five companion formats, twenty-two titles in all, currently scattered across
 *  five different rails where nobody can see the scale of it.
 *
 *  Nothing here is authored: the structure is read out of the titles, because
 *  the naming already encodes it — "| Sezonul 9", "| Spania | Sezonul 10",
 *  "PLUS", "Interviurile …". That matters for the pitch: it means the same
 *  treatment works on the real catalogue, not just on a hand-picked example. */

export type Group = { label: string; noun: string; items: Item[] }

export type Franchise = {
  key: string
  name: string
  /** the scale, in one line */
  summary: string
  groups: Group[]
  total: number
  /** artwork for the hub's backdrop */
  art: string | null
}

type Config = {
  key: string
  name: string
  match: RegExp
  /** second grouping, after the numbered seasons */
  branch: { label: string; noun: string; match: RegExp }
  companions: { label: string; match: RegExp }
}

const CONFIGS: Config[] = [
  {
    key: 'insula',
    name: 'Insula Iubirii',
    match: /insula iubirii|fiertzi pe insula/i,
    branch: {
      label: 'Ediții internaționale',
      noun: 'ediții internaționale',
      match: /spania|mexic|ungaria|brazilia|argentina|chile/i,
    },
    companions: { label: 'În jurul emisiunii', match: /plus|extra|interviurile|fiertzi|reuniuni/i },
  },
  {
    key: 'express',
    name: 'Asia & America Express',
    match: /asia express|america express|express talk|podcastito express|jurnal de c[ăa]l[ăa]torie/i,
    branch: { label: 'Drumurile', noun: 'drumuri', match: /drumul/i },
    companions: {
      label: 'În jurul emisiunii',
      match: /extra|interviurile|jurnal|podcastito|talk/i,
    },
  },
  {
    key: 'powercouple',
    name: 'Power Couple România',
    match: /power couple/i,
    branch: { label: 'Sezoane', noun: 'sezoane', match: /la bine/i },
    companions: { label: 'În jurul emisiunii', match: /making of|interviurile|fiertzi/i },
  },
]

const ALL: Item[] = [
  ...rows.trending,
  ...rows.insulaRomania,
  ...rows.insulaTakeover,
  ...rows.asiaAmerica,
  ...rows.powerCouple,
  ...rows.topShowuri,
  ...rows.extras,
  ...rows.inCurand,
  ...rows.filmeSerialeNoi,
]

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

function seasonOf(title: string): number | null {
  const m = title.match(/sezonul\s+(\d+)/i)
  return m ? Number(m[1]) : null
}

function build(config: Config): Franchise {
  const seen = new Set<string>()
  const members: Item[] = []
  for (const item of ALL) {
    if (!item.title || seen.has(item.title) || !config.match.test(item.title)) continue
    seen.add(item.title)
    members.push(item)
  }

  const companions = members.filter((i) => config.companions.match.test(i.title))
  const rest = members.filter((i) => !companions.includes(i))
  const branch = rest.filter((i) => config.branch.match.test(i.title))
  const seasons = rest
    .filter((i) => !branch.includes(i) && seasonOf(i.title) !== null)
    .sort((a, b) => (seasonOf(a.title) ?? 99) - (seasonOf(b.title) ?? 99))

  const groups: Group[] = [
    { label: 'Sezoane', noun: 'sezoane', items: seasons },
    { label: config.branch.label, noun: config.branch.noun, items: branch },
    { label: config.companions.label, noun: 'formate derivate', items: companions },
  ].filter((g) => g.items.length)

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return {
    key: config.key,
    name: config.name,
    summary: groups.map((g) => `${g.items.length} ${g.noun}`).join('  ·  '),
    groups,
    total,
    art: members.find((i) => i.cover && i.cover !== PLACEHOLDER)?.cover ?? null,
  }
}

const FRANCHISES = CONFIGS.map(build).filter((f) => f.total >= 4)

/** The franchise a title belongs to, if any. */
export function franchiseFor(title: string): Franchise | null {
  const config = CONFIGS.find((c) => c.match.test(title))
  return config ? (FRANCHISES.find((f) => f.key === config.key) ?? null) : null
}

/** Romanian takes "de" before a counted noun when the last two digits are 0 or
 *  20-99 — "8 titluri", but "22 de titluri". */
export function titleCount(n: number): string {
  const tail = n % 100
  return `${n} ${tail === 0 || tail >= 20 ? 'de titluri' : 'titluri'}`
}

export { FRANCHISES }
