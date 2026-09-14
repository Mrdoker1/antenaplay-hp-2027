/** The catalogue search behind the AI panel.
 *
 *  The point of the feature is that you describe what you are in the mood for
 *  rather than type a title, so it has to actually answer — a panel that only
 *  looks clever is worse than no panel.
 *
 *  It reads two corpora. AntenaPLAY's own catalogue carries titles and little
 *  else, which is why an earlier version could only match words. The film
 *  catalogue imported from the MovieGuesser project carries real metadata —
 *  year, genres, countries — and that is what lets a phrase like "an autumn
 *  film" or "90s sci-fi" be answered rather than guessed at.
 *
 *  Three layers do the work:
 *
 *  - **Facets** parsed out of the phrase: decade, country, and an explicit year.
 *  - **Tags** derived from genres and from the rail a title sits in, weighted
 *    inversely to how common they are, so a tag half the catalogue carries
 *    cannot outvote a rare one.
 *  - **Moods**, which is the part genres cannot express. "Autumn" is not a
 *    genre; it is a handful of genres plus a short curated list of titles that
 *    define what the word should return. The curation is deliberate and
 *    visible — see MOODS — rather than pretending a lexical matcher understands
 *    a season.
 *
 *  It is not a language model. That is the honest shape for a prototype: the
 *  interaction, the latency and the result surface are real, and swapping in an
 *  embedding call later touches this file only. */

import { canaleGratuite, canaleTv } from '../data/channels'
import { films } from '../data/films'
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
  year?: number
  /** key for src/lib/assets — a Figma hash, a show slug, or a film id */
  art: string | null
  /** the one-line descriptor shown under the title */
  vibe: string
  /** why this matched, in the viewer's words. An assistant that cannot say why
   *  it chose something is indistinguishable from a filter. */
  reasons: string[]
  score: number
}

/** A narrowing the viewer can add to the phrase. Offered only when it would
 *  actually change the result set — see `refinements`. */
export type Refinement = { label: string; append: string }

/* ── what a viewer might type ─────────────────────────────────────────────
   Tags are the shared vocabulary between the two corpora: a Kinopoisk genre
   and an AntenaPLAY rail both resolve into the same keys.

   Every tag lists both languages. The interface is Romanian, but the phrase is
   the one place a viewer reaches for whatever comes to mind — and a Romanian
   audience types English film vocabulary constantly. Words are written without
   diacritics because queries are folded before they are matched.           */

const VOCAB: Record<string, string[]> = {
  action: ['action', 'fight', 'fighting', 'explosive', 'adrenaline', 'actiune', 'bataie'],
  adventure: ['adventure', 'adventures', 'journey', 'quest', 'road', 'travel', 'odyssey', 'aventura', 'aventuri', 'calatorie', 'drum', 'drumul', 'expeditie'],
  comedy: ['comedy', 'comedies', 'funny', 'laugh', 'humour', 'humor', 'silly', 'lighthearted', 'comedie', 'amuzant', 'haios', 'umor', 'distractiv'],
  drama: ['drama', 'dramatic', 'serious', 'moving', 'emotional', 'deep', 'dramatica', 'emotionant', 'profund'],
  thriller: ['thriller', 'suspense', 'tense', 'gripping', 'suspans', 'tensiune'],
  horror: ['horror', 'scary', 'frightening', 'creepy', 'terrifying', 'groaza', 'infricosator', 'frica'],
  crime: ['crime', 'criminal', 'heist', 'gangster', 'mafia', 'crima', 'jaf', 'politist'],
  detective: ['detective', 'mystery', 'whodunit', 'investigation', 'detectiv', 'mister', 'ancheta'],
  scifi: ['scifi', 'science', 'fiction', 'space', 'futuristic', 'cyberpunk', 'robots', 'spatiu', 'viitor', 'roboti', 'stiintifico'],
  fantasy: ['fantasy', 'magic', 'magical', 'wizards', 'dragons', 'mythology', 'myth', 'fantezie', 'magie', 'mitologie', 'dragoni'],
  romance: ['romance', 'romantic', 'love', 'couples', 'dragoste', 'iubire', 'iubirii', 'cupluri'],
  family: ['family', 'kids', 'children', 'child', 'familie', 'copii', 'copil'],
  animation: ['animation', 'animated', 'cartoon', 'cartoons', 'anime', 'animatie', 'desene'],
  history: ['history', 'historical', 'period', 'ancient', 'epic', 'istorie', 'istoric', 'epopee'],
  war: ['war', 'battle', 'soldiers', 'military', 'razboi', 'militar', 'batalie'],
  biography: ['biography', 'biopic', 'biographical', 'truestory', 'biografie', 'biografic'],
  sport: ['sport', 'sports', 'football', 'formula', 'tennis', 'hockey', 'match', 'championship', 'cup', 'fotbal', 'tenis', 'hochei', 'meci', 'campionat'],
  musical: ['musical', 'music', 'songs', 'muzical', 'muzica'],
  western: ['western', 'cowboys'],
  documentary: ['documentary', 'documentaries', 'behind', 'scenes', 'interview', 'interviews', 'diary', 'documentar', 'culise', 'interviu', 'jurnal'],
  reality: ['reality', 'show', 'shows', 'contestants', 'island', 'concurenti', 'insula'],
  series: ['series', 'season', 'seasons', 'episode', 'episodes', 'serial', 'seriale', 'sezon', 'sezonul', 'episod'],
  film: ['film', 'films', 'movie', 'movies', 'feature', 'filme'],
  short: ['short', 'clip', 'clips', 'quick', 'moment', 'moments', 'scurt', 'scurte', 'rapid', 'momente'],
  live: ['live', 'now', 'tonight', 'airing', 'onair', 'direct', 'acum', 'diseara', 'seara'],
  channel: ['channel', 'channels', 'canal', 'canale'],
  free: ['free', 'gratuit', 'gratuite'],
  fresh: ['new', 'newest', 'recent', 'latest', 'upcoming', 'soon', 'nou', 'noi', 'noua', 'curand', 'proaspat'],
  local: ['romanian', 'romania', 'local', 'antena', 'antenaplay', 'romanesc', 'romaneasca', 'romana'],
}

/** Words that carry no signal: "something short and funny" is two words long. */
const STOP = new Set([
  'a','an','the','and','or','of','with','for','me','i','want','something','anything','find','watch',
  'show','some','to','is','are','in','on','at','my','we','us','give','please','about','like','that',
  'this','it','its','be','can','you','your','would','could','should','do','does','get','see','look',
  'mood','vibe','feel','feeling','night','evening','today','good','nice','best','really','very','more',
  'ceva','cu','si','sau','de','la','in','pe','un','o','al','ale','care','vreau','caut','arata','gaseste',
  'mi','as','vrea','sa','vad','ma','uit','despre','pentru','din','mai','foarte','este','imi','placa','anii',
])

/* ── moods ────────────────────────────────────────────────────────────────
   The part genres cannot express. Each mood is the words that evoke it, the
   genres that lean that way, and a short list of titles that define the answer
   — curated on purpose, because no amount of genre matching makes a catalogue
   know what "autumn" feels like.                                            */

type Mood = { words: string[]; genres: string[]; anchors: string[]; vibe: string }

const MOODS: Record<string, Mood> = {
  autumn: {
    words: ['autumn', 'autumnal', 'fall', 'rainy', 'melancholy', 'wistful', 'contemplative', 'reflective', 'toamna', 'toamnei', 'ploios', 'melancolic', 'nostalgic'],
    genres: ['приключения', 'драма', 'фэнтези', 'история'],
    // The first anchor is the answer the room expects: a long, warm, mythic
    // journey is the picture the word conjures.
    anchors: ['kp6385370', 'kp1071383', 'kp409424', 'kp939785', 'kp1395801'],
    vibe: 'Lung, cald și mitic',
  },
  cosy: {
    words: ['cosy', 'cozy', 'comfort', 'comforting', 'gentle', 'sunday', 'confortabil', 'linistit', 'duminica', 'cald'],
    genres: ['семейный', 'мультфильм', 'мелодрама', 'комедия'],
    anchors: ['kp775278', 'kp775273', 'kp1395801', 'kp1009142'],
    vibe: 'Blând și cald',
  },
  feelgood: {
    words: ['feelgood', 'cheerful', 'happy', 'uplifting', 'easy', 'vesel', 'pozitiv', 'usor'],
    genres: ['комедия', 'семейный', 'мультфильм', 'мелодрама'],
    anchors: [],
    vibe: 'Ușor de privit',
  },
  mindbending: {
    words: ['mindbending', 'twist', 'twisty', 'clever', 'confusing', 'puzzle', 'cerebral', 'rasturnare', 'intortocheat', 'complicat'],
    genres: ['фантастика', 'триллер', 'детектив'],
    anchors: [],
    vibe: 'Te ține în priză',
  },
  epic: {
    words: ['epic', 'grand', 'sweeping', 'spectacle', 'blockbuster', 'grandios', 'spectaculos'],
    genres: ['приключения', 'фэнтези', 'история', 'военный'],
    anchors: [],
    vibe: 'La scară mare',
  },
  dark: {
    words: ['dark', 'gritty', 'bleak', 'brutal', 'violent', 'intunecat', 'dur', 'sumbru'],
    genres: ['криминал', 'триллер', 'ужасы', 'боевик'],
    anchors: [],
    vibe: 'Întunecat și tăios',
  },
}

/** Kinopoisk genres are Russian; this is where they join the shared vocabulary. */
const GENRE_TAGS: Record<string, string[]> = {
  боевик: ['action'],
  приключения: ['adventure'],
  комедия: ['comedy'],
  драма: ['drama'],
  триллер: ['thriller'],
  ужасы: ['horror'],
  криминал: ['crime'],
  детектив: ['detective'],
  фантастика: ['scifi'],
  фэнтези: ['fantasy'],
  мелодрама: ['romance'],
  семейный: ['family'],
  детский: ['family'],
  мультфильм: ['animation', 'family'],
  аниме: ['animation'],
  история: ['history'],
  военный: ['war'],
  биография: ['biography'],
  спорт: ['sport'],
  мюзикл: ['musical'],
  музыка: ['musical'],
  вестерн: ['western'],
  документальный: ['documentary'],
  короткометражка: ['short'],
}

const GENRE_LABEL: Record<string, string> = {
  боевик: 'Acțiune',
  приключения: 'Aventură',
  комедия: 'Comedie',
  драма: 'Dramă',
  триллер: 'Thriller',
  ужасы: 'Groază',
  криминал: 'Crimă',
  детектив: 'Mister',
  фантастика: 'SF',
  фэнтези: 'Fantezie',
  мелодрама: 'Romantic',
  семейный: 'Familie',
  детский: 'Copii',
  мультфильм: 'Animație',
  аниме: 'Anime',
  история: 'Istorie',
  военный: 'Război',
  биография: 'Biografie',
  спорт: 'Sport',
  мюзикл: 'Muzical',
  музыка: 'Muzică',
  вестерн: 'Western',
  документальный: 'Documentar',
  короткометражка: 'Scurtmetraj',
}

const TAG_LABEL: Record<string, string> = {
  action: 'Acțiune',
  adventure: 'Aventură',
  comedy: 'Comedie',
  drama: 'Dramă',
  thriller: 'Thriller',
  horror: 'Groază',
  crime: 'Crimă',
  detective: 'Mister',
  scifi: 'SF',
  fantasy: 'Fantezie',
  romance: 'Romantic',
  family: 'Familie',
  animation: 'Animație',
  history: 'Istorie',
  war: 'Război',
  biography: 'Biografie',
  sport: 'Sport',
  musical: 'Muzical',
  western: 'Western',
  documentary: 'Documentar',
  reality: 'Reality',
  series: 'Serial',
  film: 'Film',
  short: 'Scurt',
  live: 'În direct',
  channel: 'Canal',
  free: 'Gratuit',
  fresh: 'Nou',
  local: 'Românesc',
}

const MOOD_LABEL: Record<string, string> = {
  autumn: 'Toamnă',
  cosy: 'Cozy',
  feelgood: 'Bine dispus',
  mindbending: 'Cu răsturnări',
  epic: 'Epic',
  dark: 'Întunecat',
}

const COUNTRY_LABEL: Record<string, string> = {
  США: 'SUA',
  Россия: 'Rusia',
  СССР: 'URSS',
  Великобритания: 'Marea Britanie',
  Франция: 'Franța',
  Германия: 'Germania',
  Япония: 'Japonia',
  Италия: 'Italia',
  Испания: 'Spania',
  Китай: 'China',
  Корея: 'Coreea',
}

const COUNTRY_WORDS: Record<string, string[]> = {
  США: ['american', 'america', 'usa', 'hollywood'],
  Россия: ['russian', 'russia'],
  СССР: ['soviet', 'ussr'],
  Великобритания: ['british', 'britain', 'uk', 'english'],
  Франция: ['french', 'france'],
  Германия: ['german', 'germany'],
  Япония: ['japanese', 'japan'],
  Италия: ['italian', 'italy'],
  Испания: ['spanish', 'spain'],
  Китай: ['chinese', 'china'],
  Корея: ['korean', 'korea'],
}

const fold = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .toLowerCase()

/** Whether a typed token means the same thing as a vocabulary word. A prefix
 *  rule is needed for plurals and inflections, but an unguarded one is worse
 *  than none — it once had "couples" matching "cup" and returning the World
 *  Cup shelf. Hence the length floors. */
function related(token: string, word: string): boolean {
  if (token === word) return true
  if (token.length >= 4 && word.startsWith(token) && word.length - token.length <= 4) return true
  if (word.length >= 4 && token.startsWith(word) && token.length - word.length <= 4) return true
  return false
}

/* ── the index ────────────────────────────────────────────────────────────── */

type Kind = 'film' | 'title' | 'channel' | 'event'

type Entry = {
  key: string
  title: string
  folded: string
  art: string | null
  tags: string[]
  moods: string[]
  genres: string[]
  year?: number
  countries: string[]
  kind: Kind
  vibe: string
}

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

/** AntenaPLAY's own titles are Romanian and the queries are English, so the
 *  rail a show sits in is not the only signal available — its name carries one
 *  too. Without this the catalogue answers only to its own words, and a phrase
 *  like "short and funny" never reaches the clips. */
const SHOW_PATTERNS: [RegExp, string[]][] = [
  [/nedifuzate|momente|\bplus\b|\bextra\b/i, ['short']],
  [/interviurile|jurnal de c|jurnal de calatorie|making of/i, ['documentary']],
  [/insula|mireasa|chefi|power couple|asia express|america express|furnicu|fiertzi/i, ['reality']],
  [/iubirii|dragoste|romantic/i, ['romance']],
  [/asia express|america express|drumul|calatorie|express/i, ['adventure']],
  [/formula|uefa|tenis|hochei|mondial|nations league|world cup|supercup|endurance|\bnhl\b/i, ['sport']],
  [/sezonul|sezon\b|episod/i, ['series']],
  [/umor|roast|comedy|bunicul/i, ['comedy']],
  [/podcastito|talk\b/i, ['documentary', 'short']],
]

function showTags(title: string): string[] {
  const out = new Set<string>()
  for (const [re, tags] of SHOW_PATTERNS) if (re.test(title)) for (const t of tags) out.add(t)
  return [...out]
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

const SHOW_VIBE: [string, string][] = [
  ['sport', 'Sport în direct'],
  ['romance', 'Dragoste și tensiune'],
  ['adventure', 'Aventură pe drum'],
  ['reality', 'Reality românesc'],
  ['comedy', 'Comedie'],
  ['documentary', 'Din spatele camerei'],
  ['short', 'Moment scurt'],
  ['series', 'Serial'],
  ['film', 'Film'],
]

function moodsFor(genres: string[], id?: string): string[] {
  const out: string[] = []
  for (const [name, mood] of Object.entries(MOODS)) {
    if ((id && mood.anchors.includes(id)) || genres.some((g) => mood.genres.includes(g))) {
      out.push(name)
    }
  }
  return out
}

const CYRILLIC = /[\u0400-\u04FF]/

function buildIndex(): Entry[] {
  const out: Entry[] = []

  for (const film of films) {
    // The pool is a Russian catalogue and roughly a third of it has no
    // latin title. Those are dropped rather than shown untranslated, since
    // every other word on this surface is English.
    if (!film.en || CYRILLIC.test(film.en)) continue
    const tags = [...new Set(['film', ...film.genres.flatMap((g) => GENRE_TAGS[g] ?? [])])]
    const label = film.genres.map((g) => GENRE_LABEL[g]).filter(Boolean).slice(0, 2).join(' · ')
    out.push({
      key: `film:${film.id}`,
      title: film.en && film.en !== film.ru ? film.en : film.ru,
      folded: fold(`${film.en} ${film.ru}`),
      art: film.id,
      tags,
      moods: moodsFor(film.genres, film.id),
      genres: film.genres,
      year: film.year,
      countries: film.countries,
      kind: 'film',
      vibe: `${label || 'Film'} · ${film.year}`,
    })
  }

  const shows = new Map<string, Entry>()
  const addShow = (title: string, art: string | null, tags: string[], kind: Kind, vibe?: string) => {
    if (!title) return
    const existing = shows.get(title)
    if (existing) {
      for (const t of tags) if (!existing.tags.includes(t)) existing.tags.push(t)
      if (!existing.art && art) existing.art = art
      if (existing.kind === 'channel' && kind !== 'channel') existing.kind = kind
      existing.vibe = vibe ?? SHOW_VIBE.find(([t]) => existing.tags.includes(t))?.[1] ?? 'Din catalog'
      return
    }
    const all = [...new Set(tags)]
    shows.set(title, {
      key: `show:${title}`,
      title,
      folded: fold(title),
      art,
      tags: all,
      moods: [],
      genres: [],
      countries: [],
      kind,
      vibe: vibe ?? SHOW_VIBE.find(([t]) => all.includes(t))?.[1] ?? 'Din catalog',
    })
  }

  for (const [rail, items] of RAILS) {
    for (const item of items) {
      addShow(item.name, item.cover ?? null, ['local', ...(RAIL_TAGS[rail] ?? []), ...showTags(item.name)], 'title')
    }
  }
  for (const c of canaleTv) addShow(c.name, c.logo, ['local', 'channel', 'live'], 'channel', 'Canal TV')
  for (const c of canaleGratuite) addShow(c.name, c.logo, ['local', 'channel', 'live', 'free'], 'channel', 'Canal gratuit')
  for (const e of liveEvents) addShow(e.title, e.still ?? null, ['local', 'sport', 'live'], 'event', 'Sport în direct')

  return [...out, ...shows.values()]
}

const INDEX = buildIndex()

/** Tag weights, inverse to how common the tag is. Without this a tag half the
 *  catalogue carries counts as much as one two titles carry, and a broad phrase
 *  returns whatever happens to sort first. */
const TAG_WEIGHT: Record<string, number> = (() => {
  const df: Record<string, number> = {}
  for (const e of INDEX) for (const t of e.tags) df[t] = (df[t] ?? 0) + 1
  const out: Record<string, number> = {}
  for (const [tag, n] of Object.entries(df)) out[tag] = 1.6 + Math.log(INDEX.length / Math.max(n, 1))
  return out
})()

/* ── querying ─────────────────────────────────────────────────────────────── */

export type Parsed = {
  tokens: string[]
  tags: string[]
  moods: string[]
  countries: string[]
  decade?: number
  year?: number
}

/** Phrases that must survive tokenising as one idea. */
function normalise(raw: string): string {
  return raw
    .replace(/\bsci[\s-]*fi\b/g, 'scifi')
    .replace(/\bfeel[\s-]*good\b/g, 'feelgood')
    .replace(/\bmind[\s-]*bending\b/g, 'mindbending')
    .replace(/\btrue story\b/g, 'truestory')
}

export function parse(query: string): Parsed {
  const raw = normalise(fold(query))
  const tokens = raw.split(/[^a-z0-9']+/).map((t) => t.replace(/'/g, '')).filter((w) => w.length > 1 && !STOP.has(w))

  const tags = new Set<string>()
  for (const [tag, words] of Object.entries(VOCAB)) {
    if (tokens.some((tok) => words.some((w) => related(tok, w)))) tags.add(tag)
  }

  const moods = Object.entries(MOODS)
    .filter(([, m]) => tokens.some((tok) => m.words.some((w) => related(tok, w))))
    .map(([name]) => name)

  const countries = Object.entries(COUNTRY_WORDS)
    .filter(([, words]) => tokens.some((tok) => words.some((w) => related(tok, w))))
    .map(([country]) => country)

  // "90s", "the 80s", "1990s", "2000s"
  let decade: number | undefined
  // "90s", "1990s", and the Romanian "anii '90"
  const dm = raw.match(/\b(19|20)?(\d0)s\b/) || raw.match(/anii\s*'?(19|20)?(\d0)\b/)
  if (dm) {
    const two = Number(dm[2])
    decade = dm[1] ? Number(`${dm[1]}${dm[2]}`) : two >= 30 ? 1900 + two : 2000 + two
  }
  const ym = raw.match(/\b(19\d{2}|20\d{2})\b/)
  const year = ym && !dm ? Number(ym[1]) : undefined

  return { tokens, tags: [...tags], moods, countries, decade, year }
}

export function search(query: string, limit = 6): Hit[] {
  const q = parse(query)
  if (!q.tokens.length && !q.decade && !q.year) return []

  const hits: Hit[] = []
  for (const entry of INDEX) {
    const reasons: string[] = []
    // Naming a country or a decade is a constraint, not a preference: "french
    // drama" that answers with Danish films is not answering.
    if (q.countries.length && !q.countries.some((c) => entry.countries.includes(c))) continue
    if (q.decade !== undefined && entry.kind === 'film') {
      if (entry.year === undefined || entry.year < q.decade || entry.year >= q.decade + 10) continue
    }

    let score = 0

    for (const tok of q.tokens) {
      if (tok.length < 4) continue
      // Match at a word start, not anywhere inside one. Plain `includes` had
      // "sci" pulling in "Scissorhands" and "movie" pulling in every title
      // with the word in it, which outranked the films actually asked for.
      const at = entry.folded.indexOf(tok)
      if (at < 0) continue
      const boundary = at === 0 || !/[a-z0-9]/.test(entry.folded[at - 1])
      if (boundary) score += at === 0 ? 8 : 6
      else if (tok.length >= 6) score += 2
    }
    for (const tag of q.tags) {
      if (!entry.tags.includes(tag)) continue
      score += TAG_WEIGHT[tag] ?? 2
      const label = TAG_LABEL[tag]
      if (label && !reasons.includes(label)) reasons.push(label)
    }

    for (const name of q.moods) {
      const mood = MOODS[name]
      // A curated anchor is the mood's definition, not a coincidence of genre,
      // and the first one is the answer the phrase is really asking for.
      const rank = entry.art ? mood.anchors.indexOf(entry.art) : -1
      if (rank === 0) score += 34
      else if (rank > 0) score += 22 - rank * 2
      else if (entry.moods.includes(name)) score += 5
      else continue
      const label = MOOD_LABEL[name]
      if (label && !reasons.includes(label)) reasons.unshift(label)
    }

    if (q.decade !== undefined && entry.year !== undefined) {
      score += 6
      reasons.push(`Anii ${String(q.decade).slice(2)}`)
    }
    if (q.year && entry.year !== undefined) {
      const gap = Math.abs(entry.year - q.year)
      score += gap === 0 ? 10 : gap <= 2 ? 4 : -2
    }
    for (const country of q.countries) {
      if (!entry.countries.includes(country)) continue
      score += 8
      const label = COUNTRY_LABEL[country]
      if (label && !reasons.includes(label)) reasons.push(label)
    }

    if (q.tags.length > 1) {
      const covered = q.tags.filter((t) => entry.tags.includes(t)).length
      if (covered === q.tags.length) score += 7
      else if (covered > 1) score += 3
    }

    if (score <= 0) continue

    // a channel answers "what can I watch on", not "a film with"
    const wantsChannel = q.tags.includes('channel') || q.tags.includes('free')
    if (entry.kind === 'channel' && !wantsChannel) score *= 0.35
    if (entry.art) score += 0.5

    hits.push({
      title: entry.title,
      year: entry.year,
      art: entry.art,
      vibe: entry.vibe,
      reasons: reasons.slice(0, 2),
      score,
    })
  }

  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(!!b.art) - Number(!!a.art) ||
        (b.year ?? 0) - (a.year ?? 0) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit)
}

/** Narrowings worth offering for this phrase.
 *
 *  Generated from the facets the current matches actually carry, minus what the
 *  phrase already says — so every chip changes the result set and none of them
 *  lead to an empty screen. That is the difference between a refinement and a
 *  guess. */
export function refinements(query: string, limit = 4): Refinement[] {
  const q = parse(query)
  if (!q.tokens.length && q.decade === undefined) return []

  const matches = INDEX.filter(
    (e) =>
      q.tokens.some((t) => t.length >= 4 && e.folded.includes(t)) ||
      q.tags.some((t) => e.tags.includes(t)) ||
      q.moods.some((m) => e.moods.includes(m)),
  )
  if (matches.length < 3) return []

  const counts = new Map<string, number>()
  for (const e of matches) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1)

  const asked = new Set(q.tags)
  const out: Refinement[] = []
  for (const [tag, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    if (asked.has(tag) || !TAG_LABEL[tag]) continue
    // a facet everything shares narrows nothing, and one almost nothing shares
    // is a dead end
    if (n >= matches.length * 0.9 || n < 3) continue
    out.push({ label: TAG_LABEL[tag], append: TAG_LABEL[tag].toLowerCase() })
    if (out.length >= limit) break
  }

  if (q.decade === undefined && out.length < limit) {
    out.push({ label: "Anii '90", append: '90s' })
  }
  return out.slice(0, limit)
}

/** Total matches, so the panel can offer the rest. */
export function countMatches(query: string): number {
  const q = parse(query)
  if (!q.tokens.length && !q.decade && !q.year) return 0
  return INDEX.filter(
    (e) =>
      q.tokens.some((t) => t.length >= 4 && e.folded.includes(t)) ||
      q.tags.some((t) => e.tags.includes(t)) ||
      q.moods.some((m) => e.moods.includes(m)) ||
      (q.decade !== undefined && e.year !== undefined && e.year >= q.decade && e.year < q.decade + 10),
  ).length
}

/** What the search actually covers. Shown in the panel because "it searches
 *  the catalogue" is a claim, and a number is a fact. */
export const stats = {
  films: INDEX.filter((e) => e.kind === 'film').length,
  shows: INDEX.filter((e) => e.kind !== 'film').length,
}

/** Example phrases, shown as chips. Each one returns results. */
export const SUGGESTIONS = [
  'film de toamnă',
  'ceva scurt și amuzant',
  '90s sci-fi',
  'sport în direct',
  'o seară în familie',
]
