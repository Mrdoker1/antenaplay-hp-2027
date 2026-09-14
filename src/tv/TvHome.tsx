import { useCallback, useEffect, useMemo, useState } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { channelsFree, channelsTv, rows as catalogue, type ChannelItem, type Item } from '../v2027/catalog'
import { HeroVideo } from '../v3ai/HeroVideo'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { tidyTitle } from '../v2027/title'
import { TvChannelTile } from './TvChannelTile'
import { TvRail } from './TvRail'
import { franchiseFor, titleCount, type Franchise } from '../lib/franchise'
import { TvFranchiseScreen } from './TvFranchiseScreen'
import { TvLiveScreen } from './TvLiveScreen'
import { TvSectionScreen, type Filter } from './TvSectionScreen'
import { TvSearch } from './TvSearch'
import { MENU } from './menu'
import { TvSideMenu } from './TvSideMenu'
import { TvStage } from './TvStage'
import { usePointerAsRemote, useTvNav } from './useTvNav'

/** The section pages, on the same set AntenaPLAY's own TV app offers. Each
 *  filter narrows by something the catalogue actually knows — a label that
 *  filtered nothing would be worse than no filter. */
const SECTIONS: Record<string, { title: string; filters: Filter[] }> = {
  emisiuni: {
    title: 'Emisiuni',
    filters: [
      { label: 'Toate', items: [...catalogue.topShowuri, ...catalogue.trending] },
      { label: 'Reality', items: catalogue.topShowuri },
      { label: 'Insula Iubirii', items: catalogue.insulaRomania },
      { label: 'Asia & America', items: catalogue.asiaAmerica },
      { label: 'Power Couple', items: catalogue.powerCouple },
    ],
  },
  seriale: {
    title: 'Seriale',
    filters: [
      { label: 'Toate', items: [...catalogue.topSeriale, ...catalogue.filmeSerialeNoi] },
      { label: 'Top', items: catalogue.topSeriale },
      { label: 'Noi', items: catalogue.filmeSerialeNoi },
    ],
  },
  sport: {
    title: 'Sport',
    filters: [{ label: 'Toate', items: catalogue.sport }],
  },
  list: {
    title: 'Lista mea',
    filters: [{ label: 'Toate', items: catalogue.continueWatching }],
  },
}

type Rail = { title: string; items?: Item[]; channels?: ChannelItem[]; ranked?: boolean }

const RAILS: Rail[] = [
  { title: 'Canale TV', channels: [...channelsTv.slice(0, 24), ...channelsFree] },
  { title: 'Continuă de unde ai rămas', items: catalogue.continueWatching },
  { title: 'Trending în AntenaPLAY', items: catalogue.trending },
  { title: 'Top 10 în România', items: catalogue.top10.slice(0, 10), ranked: true },
  { title: 'AntenaPLAY Sport', items: catalogue.sport },
  { title: 'În curând', items: catalogue.inCurand },
  { title: 'Top filme', items: catalogue.topFilme.slice(0, 10), ranked: true },
  { title: 'Filme și seriale noi', items: catalogue.filmeSerialeNoi },
]

/** A channel is a live feed, so its backdrop moves.
 *
 *  AntenaPLAY's own streams sit behind their token gate, so what plays here is
 *  a clip from the show's official YouTube upload, cycled per channel. The
 *  point the screen is making is that standing on a channel shows you what is
 *  going out — not that this is the feed. */
const LIVE_STANDIN = ['6RYPPLbmTok', 'jvhWbe3fAbs', 'ujyPsd4XN3Y']

/** Focus moves a row at a time, and a remote held down moves it fast. Starting
 *  a player on every step would open a dozen iframes to close them again, so
 *  the feed waits for focus to settle. */
const DWELL_MS = 900

/** How the feed dissolves into the page — both edges, and applied to every
 *  layer inside the backdrop box so none of them ends on the clip.
 *
 *  The bottom stop is not cosmetic: a player is composited, so it paints over
 *  the rails whatever the stacking order says. It has to be gone by the top of
 *  the rail box (396 of 720, so 45%) or it dims the first row's heading. */
const FEED_FADE =
  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 24%, #000 60%), ' +
  'linear-gradient(to bottom, #000 20%, transparent 44%)'

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'
/** Row 0 is the hero's own actions; the rails follow. */
const HERO_ACTIONS = 2

/** AntenaPLAY home page — Smart TV.
 *
 *  Not the web page made bigger. Every decision follows from a TV having no
 *  pointer, only a focus and four directions:
 *
 *  - **Focus replaces hover**, and only the focused card shows anything.
 *  - **The backdrop follows focus**, so the detail you would otherwise open a
 *    page for is already on screen. On a device where every press costs, that
 *    is the cheapest press to remove.
 *  - **One row, plus the top of the next**, because a remote scrolls a row at a
 *    time.
 *  - **Left from the first column opens the menu**, the way every TV app trains
 *    you to reach it.
 *
 *  Nothing decorative takes focus: the logo is not a destination, so it is not
 *  in the model. The hero's Play button is, because it is the one thing most
 *  sessions actually want. */
export default function TvHome() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const [section, setSection] = useState('home')
  const menuOpen = menuIndex !== null

  const lengths = useMemo(
    () => [HERO_ACTIONS, ...RAILS.map((r) => (r.items ?? r.channels ?? []).length)],
    [],
  )

  const onEnter = useCallback(({ row, col }: { row: number; col: number }) => {
    if (row === 0) {
      if (col === 1) setSearchOpen(true)
      return
    }
    // pressing OK on a title that belongs to a franchise opens its universe
    const picked = RAILS[row - 1]?.items?.[col]
    if (picked) {
      const found = franchiseFor(picked.title)
      if (found) setFranchise(found)
    }
  }, [])

  /* Choosing a menu entry, from the remote or from a click. */
  const pickMenu = useCallback((i: number) => {
    const picked = MENU[i]
    if (!picked) return
    setMenuIndex(null)
    setFranchise(null)
    if (picked.key === 'search') setSearchOpen(true)
    else setSection(picked.key)
  }, [])

  const sectionScreen = SECTIONS[section]
  const liveScreen = section === 'live'
  const overlay = menuOpen || searchOpen || Boolean(franchise)
  const homeActive = !overlay && !sectionScreen && !liveScreen

  const { focus, setFocus } = useTvNav(lengths, onEnter, homeActive, (dir) => {
    if (dir === 'left') setMenuIndex(MENU.findIndex((m) => m.key === section))
  })
  const openMenu = useCallback(
    () => setMenuIndex(MENU.findIndex((m) => m.key === section)),
    [section],
  )
  const onPointer = usePointerAsRemote(setFocus, onEnter, homeActive, openMenu)

  /* The menu owns the remote while it is open, and Left from the first column
     is how you hand it over. */
  useEffect(() => {
    if (searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (!menuOpen) {
        if (franchise && (e.key === 'Escape' || e.key === 'Backspace')) {
          e.preventDefault()
          setFranchise(null)
        }
        return
      }
      e.preventDefault()
      switch (e.key) {
        case 'ArrowUp':
          setMenuIndex((i) => Math.max(0, (i ?? 0) - 1))
          break
        case 'ArrowDown':
          setMenuIndex((i) => Math.min(MENU.length - 1, (i ?? 0) + 1))
          break
        case 'ArrowRight':
        case 'Escape':
        case 'Backspace':
          setMenuIndex(null)
          break
        case 'Enter':
          pickMenu(menuIndex)
          break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, menuIndex, searchOpen, franchise, pickMenu])

  const rail = focus.row > 0 ? RAILS[focus.row - 1] : null
  /* A channel is not a title: standing on one, the hero has to say which channel
     and what is on it, not fall back to somebody else's artwork. */
  const channel = rail?.channels?.[focus.col] ?? null
  const item = rail?.items?.[focus.col] ?? catalogue.continueWatching[0]
  const artKey = channel || item.cover === PLACEHOLDER ? null : item.cover
  const art = asset(artKey)
  const channelLogo = asset(channel?.logo ?? null)
  const { a1 } = accentFromTitle(channel?.name ?? item.title ?? 'antena')
  /* A card that leads somewhere deeper has to say so — on a remote there is no
     hover to discover it with. */
  const universe = focus.row > 0 && !channel ? franchiseFor(item.title) : null

  /* The cover over the sliced row only earns its place once something has
     actually scrolled past — at the top of the list it would dim the first
     heading for nothing. */
  const [scrolled, setScrolled] = useState(false)
  const [rested, setRested] = useState<string | null>(null)
  useEffect(() => {
    const name = channel?.name
    if (!name) return
    const t = setTimeout(() => setRested(name), DWELL_MS)
    return () => clearTimeout(t)
  }, [channel])

  /* A name left over from a channel you have moved off matches nothing, so
     there is no state to clear — which keeps the feed instant on the way back. */
  const feed =
    channel && rested === channel.name
      ? LIVE_STANDIN[[...channel.name].reduce((n, c) => n + c.charCodeAt(0), 0) % LIVE_STANDIN.length]
      : null

  useEffect(() => {
    document.documentElement.dataset.skin = 'tv'
    return () => {
      delete document.documentElement.dataset.skin
    }
  }, [])

  return (
    <TvStage>
      {/* the menu dims the rest rather than replacing it, so you keep your
          place — and it is present on every screen, not just the home one.
          Clicking the dimmed part is the Right press that closes it. */}
      <div
        onClick={() => setMenuIndex(null)}
        className={`absolute inset-0 z-30 bg-black/55 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <TvSideMenu open={menuOpen} index={menuIndex ?? 0} active={section} onPick={pickMenu} />

      {!sectionScreen && !liveScreen && (
        /* `display: contents` so the click delegation costs the layout nothing */
        <div className="contents" onClick={onPointer}>
        {/* The backdrop is card artwork — 537px wide at best — so stretching it
            across 1280 is what made it look soft. It now occupies the right 62%,
            which is roughly its native size, and dissolves into the page with a
            mask rather than ending on a visible edge. */}
        <div className="absolute inset-y-0 right-0 w-[62%] overflow-hidden">
          {feed ? (
            <div className="relative size-full overflow-hidden">
              {/* The fed colour stays underneath, so the channel keeps its own
                  hue while the player boots — and it carries the same fade, or
                  it ends on the clip edge as a visible band beside the feed. */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(90% 110% at 80% 0%, hsl(${a1} / 0.5), transparent 70%)`,
                  maskImage: FEED_FADE,
                  maskComposite: 'intersect',
                  WebkitMaskImage: FEED_FADE,
                  WebkitMaskComposite: 'source-in',
                }}
              />
              {/* A 16:9 player in a box this tall letterboxes, so the frame is
                  sized wider than the box and centred — the video covers and the
                  bars fall outside. */}
              {/* This box is taller than it is wide, so the frame is scaled
                  well past it — otherwise the 16:9 video letterboxes inside. */}
              <HeroVideo
                key={feed}
                id={feed}
                muted
                scale={1.8}
                fade={FEED_FADE}
              />
            </div>
          ) : art ? (
            <img
              key={artKey}
              src={art}
              alt=""
              className="size-full object-cover object-top"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 22%, #000 52%), linear-gradient(to bottom, #000 46%, transparent 92%)',
                maskComposite: 'intersect',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 22%, #000 52%), linear-gradient(to bottom, #000 46%, transparent 92%)',
                WebkitMaskComposite: 'source-in',
              }}
            />
          ) : (
            <div
              className="size-full"
              style={{ backgroundImage: `radial-gradient(90% 110% at 80% 0%, hsl(${a1} / 0.5), transparent 70%)` }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(97deg,var(--color-tv-ground)_2%,rgba(7,7,10,0.88)_28%,rgba(7,7,10,0.35)_54%,transparent_86%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-transparent via-tv-ground/80 to-tv-ground" />

        {/* The AntenaPLAY logo lives in the side menu now — it is not a
            destination, and the corner is worth more to the channel you are
            standing on than to our own mark. */}
        {channelLogo && (
          <div
            className="absolute inset-x-0 top-0 flex justify-end"
            style={{ paddingRight: 'var(--tv-safe)', paddingTop: 26 }}
          >
            <img
              src={channelLogo}
              alt=""
              className="h-[58px] w-auto max-w-[200px] object-contain object-right drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]"
            />
          </div>
        )}

        <div
          className="absolute left-0 right-0"
          style={{
            paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe))',
            paddingRight: 'var(--tv-safe)',
            top: 48,
          }}
        >
          {/* Two lines of room for the title whether it needs them or not:
              unclamped, a one-line title pulls the metadata and the buttons up
              and the whole block jumps as focus moves along a rail. The
              eyebrow and the title sit at the bottom of that room together, so
              the slack falls into empty space above them rather than opening a
              hole between the title and what it belongs to. */}
          <div className="flex min-h-[180px] max-w-[620px] flex-col justify-end">
            <p className="font-meta text-[19px]/[26px] uppercase tracking-[0.16em] text-tv-dim">
              {rail ? rail.title : 'AntenaPLAY'}
            </p>
            <h1 className="mt-[10px] line-clamp-2 text-[50px]/[54px] font-black tracking-[-0.03em]">
              {tidyTitle(channel ? channel.name : item.title)}
            </h1>
            <p className="mt-[10px] flex items-center gap-[10px] font-meta text-[20px]/[26px] uppercase tracking-[0.1em] text-tv-dim">
              {channel?.badge === 'live' && (
                <span className="flex items-center gap-[7px] rounded-[6px] bg-tv-action px-[9px] py-[2px] text-[16px]/[22px] text-tv-fg">
                  <span className="size-[7px] rounded-full bg-white" />
                  Live
                </span>
              )}
              {channel ? channel.now : item.meta}
            </p>
          </div>

          {/* The universe hint belongs with the actions, because it is one: OK
              on this card opens the hub. On its own line above the buttons it
              wrapped to two and pushed them down behind the rails. */}
          <div className="mt-[18px] flex items-center gap-[22px]">
            <span
              data-tv="0,0"
              className={`flex cursor-pointer items-center gap-[10px] rounded-full bg-tv-action px-[22px] py-[10px] text-[21px]/[26px] font-bold transition-transform duration-200 ${
                focus.row === 0 && focus.col === 0 ? 'tv-focus scale-[1.04]' : ''
              }`}
            >
              <PlayGlyph className="size-[20px]" />
              {channel ? 'Intră' : 'Redă'}
            </span>
            <span
              data-tv="0,1"
              className={`flex cursor-pointer items-center gap-[10px] rounded-full bg-white/12 px-[22px] py-[10px] text-[21px]/[26px] font-semibold transition-transform duration-200 ${
                focus.row === 0 && focus.col === 1 ? 'tv-focus-ai scale-[1.04]' : ''
              }`}
            >
              <Sparkle className="size-[22px] text-tv-fg" />
              Caută cu vocea
            </span>

            {/* No fill and no pill: beside two buttons a filled capsule reads
                as a third one, and this is a caption, not a control. What it
                says is what the OK key does on the card below. */}
            {universe && (
              <p className="flex items-center gap-[9px] whitespace-nowrap ps-[4px] font-meta text-[17px]/[22px] uppercase tracking-[0.1em] text-tv-dim [text-shadow:0_1px_8px_rgba(0,0,0,0.95)]">
                <span className="rounded-[6px] border border-tv-fg/45 bg-black/35 px-[8px] py-[1px] text-[15px]/[20px] font-bold text-tv-fg/85">
                  OK
                </span>
                {titleCount(universe.total)} în univers
              </p>
            )}
          </div>
        </div>

        {/* one row in full, the next peeking — a remote moves a row at a time.
            The padding is what keeps a focused card's ring and lift from being
            clipped: overflow cuts at the padding box, so the room has to be
            padding rather than margin. */}
        {/* The logo used to sit above the hero; without it the whole column
            starts higher, and the rails take the room that frees. */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: 396 }}>

          <div
            className="tv-no-scrollbar h-full overflow-y-auto py-[30px]"
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
            style={{
              paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe) - 26px)',
              paddingRight: 'calc(var(--tv-safe) - 26px)',
              /* The row above the focused one is sliced by the scrollport, and
                 the slice — card bottoms and their progress bars — lands right
                 under the hero's buttons. Hiding it has to be a mask on the
                 list, not a panel painted over it: a panel is opaque ground and
                 draws a black band across the artwork behind. Measured: the
                 slice ends 38px in, the next heading starts at 67. */
              ...(scrolled
                ? {
                    maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 38px, #000 62px)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0px, transparent 38px, #000 62px)',
                  }
                : null),
            }}
          >
            {RAILS.map((r, rowIndex) =>
              r.channels ? (
                <section key={r.title} className="pb-[16px]">
                  <h2
                    className={`px-[26px] text-[24px]/[30px] font-bold tracking-[-0.01em] transition-colors ${
                      focus.row === rowIndex + 1 ? 'text-tv-fg' : 'text-tv-faint'
                    }`}
                  >
                    {r.title}
                  </h2>
                  <div className="tv-no-scrollbar -my-[16px] mt-[-6px] flex gap-[16px] overflow-x-auto px-[26px] py-[30px]">
                    {r.channels.map((c, colIndex) => (
                      <TvChannelTile
                        key={`${c.name}-${colIndex}`}
                        channel={c}
                        focused={focus.row === rowIndex + 1 && focus.col === colIndex}
                        cell={`${rowIndex + 1},${colIndex}`}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <TvRail
                  key={r.title}
                  title={r.title}
                  items={r.items ?? []}
                  rowIndex={rowIndex + 1}
                  focus={focus}
                  ranked={r.ranked}
                />
              ),
            )}
          </div>
        </div>
        </div>
      )}

      {sectionScreen && (
        <TvSectionScreen
          title={sectionScreen.title}
          filters={sectionScreen.filters}
          active={!overlay}
          onOpenMenu={() => setMenuIndex(MENU.findIndex((m) => m.key === section))}
        />
      )}

      {liveScreen && (
        <TvLiveScreen
          active={!overlay}
          onOpenMenu={() => setMenuIndex(MENU.findIndex((m) => m.key === section))}
        />
      )}

      {franchise && (
        <TvFranchiseScreen
          franchise={franchise}
          active={!menuOpen && !searchOpen}
          onClose={() => setFranchise(null)}
        />
      )}

      {searchOpen && <TvSearch onClose={() => setSearchOpen(false)} />}
    </TvStage>
  )
}

/** White rather than the assistant's violet: over a bright backdrop the violet
 *  disappeared into the artwork. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.6l1.7 5.1a2 2 0 0 0 1.26 1.26L20.1 10.7l-5.14 1.74a2 2 0 0 0-1.26 1.26L12 18.84l-1.7-5.14a2 2 0 0 0-1.26-1.26L3.9 10.7l5.14-1.74A2 2 0 0 0 10.3 7.7z" />
    </svg>
  )
}
