import { useCallback, useEffect, useMemo, useState } from 'react'
import mark from '../assets/antena-mark.svg'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { channelsFree, channelsTv, rows as catalogue, type ChannelItem, type Item } from '../v2027/catalog'
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
import { useTvNav } from './useTvNav'

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

  const sectionScreen = SECTIONS[section]
  const liveScreen = section === 'live'
  const overlay = menuOpen || searchOpen || Boolean(franchise)
  const homeActive = !overlay && !sectionScreen && !liveScreen

  const { focus } = useTvNav(lengths, onEnter, homeActive, (dir) => {
    if (dir === 'left') setMenuIndex(MENU.findIndex((m) => m.key === section))
  })

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
        case 'Enter': {
          const picked = MENU[menuIndex]
          setMenuIndex(null)
          setFranchise(null)
          if (picked.key === 'search') setSearchOpen(true)
          else setSection(picked.key)
          break
        }
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, menuIndex, searchOpen, franchise])

  const rail = focus.row > 0 ? RAILS[focus.row - 1] : null
  /* A channel is not a title: standing on one, the hero has to say which channel
     and what is on it, not fall back to somebody else's artwork. */
  const channel = rail?.channels?.[focus.col] ?? null
  const item = rail?.items?.[focus.col] ?? catalogue.continueWatching[0]
  const artKey = channel || item.cover === PLACEHOLDER ? null : item.cover
  const art = asset(artKey)
  const { a1 } = accentFromTitle(channel?.name ?? item.title ?? 'antena')
  /* A card that leads somewhere deeper has to say so — on a remote there is no
     hover to discover it with. */
  const universe = focus.row > 0 && !channel ? franchiseFor(item.title) : null

  useEffect(() => {
    document.documentElement.dataset.skin = 'tv'
    return () => {
      delete document.documentElement.dataset.skin
    }
  }, [])

  return (
    <TvStage>
      {/* the menu dims the rest rather than replacing it, so you keep your
          place — and it is present on every screen, not just the home one */}
      <div
        className={`absolute inset-0 z-30 bg-black/55 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <TvSideMenu open={menuOpen} index={menuIndex ?? 0} active={section} />

      {!sectionScreen && !liveScreen && (
        <>
        {/* The backdrop is card artwork — 537px wide at best — so stretching it
            across 1280 is what made it look soft. It now occupies the right 62%,
            which is roughly its native size, and dissolves into the page with a
            mask rather than ending on a visible edge. */}
        <div className="absolute inset-y-0 right-0 w-[62%] overflow-hidden">
          {art ? (
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

        {/* the logo is not a destination, so it is not focusable */}
        <div
          className="absolute inset-x-0 top-0 flex items-center"
          style={{
            paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe))',
            paddingRight: 'var(--tv-safe)',
            paddingTop: 26,
          }}
        >
          <span className="flex items-baseline gap-[8px]">
            <img src={mark} alt="" className="h-[24px] w-auto" />
            <span className="text-[24px]/[28px] font-black tracking-[-0.03em]">
              antena<span className="font-light text-tv-fg/65">PLAY</span>
            </span>
          </span>
        </div>

        <div
          className="absolute left-0 right-0"
          style={{
            paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe))',
            paddingRight: 'var(--tv-safe)',
            top: 96,
          }}
        >
          <div className="max-w-[620px]">
            <p className="font-meta text-[19px]/[26px] uppercase tracking-[0.16em] text-tv-dim">
              {rail ? rail.title : 'AntenaPLAY'}
            </p>
            <h1 className="mt-[10px] line-clamp-2 text-[50px]/[54px] font-black tracking-[-0.03em]">
              {tidyTitle(channel ? channel.name : item.title)}
            </h1>
            <p className="mt-[12px] flex items-center gap-[10px] font-meta text-[20px]/[26px] uppercase tracking-[0.1em] text-tv-dim">
              {channel?.badge === 'live' && (
                <span className="flex items-center gap-[7px] rounded-[6px] bg-tv-action px-[9px] py-[2px] text-[16px]/[22px] text-tv-fg">
                  <span className="size-[7px] rounded-full bg-white" />
                  Live
                </span>
              )}
              {channel ? channel.now : item.meta}
            </p>
            {universe && (
              <p className="mt-[12px] flex w-fit items-center gap-[10px] rounded-full bg-white/10 py-[6px] pe-[16px] ps-[8px] font-meta text-[17px]/[22px] uppercase tracking-[0.1em] text-tv-fg/85">
                <span className="rounded-full bg-tv-fg px-[10px] py-[2px] text-[15px]/[20px] font-bold text-tv-ground">
                  OK
                </span>
                Universul {universe.name}  ·  {titleCount(universe.total)}
              </p>
            )}

            <div className={`flex items-center gap-[22px] ${universe ? 'mt-[14px]' : 'mt-[18px]'}`}>
              <span
                className={`flex items-center gap-[10px] rounded-full bg-tv-action px-[22px] py-[10px] text-[21px]/[26px] font-bold transition-transform duration-200 ${
                  focus.row === 0 && focus.col === 0 ? 'tv-focus scale-[1.04]' : ''
                }`}
              >
                <PlayGlyph className="size-[20px]" />
                {channel ? 'Intră' : 'Redă'}
              </span>
              <span
                className={`flex items-center gap-[10px] rounded-full bg-white/12 px-[22px] py-[10px] text-[21px]/[26px] font-semibold transition-transform duration-200 ${
                  focus.row === 0 && focus.col === 1 ? 'tv-focus-ai scale-[1.04]' : ''
                }`}
              >
                <Sparkle className="size-[22px] text-tv-fg" />
                Caută cu vocea
              </span>
            </div>
          </div>
        </div>

        {/* one row in full, the next peeking — a remote moves a row at a time.
            The padding is what keeps a focused card's ring and lift from being
            clipped: overflow cuts at the padding box, so the room has to be
            padding rather than margin. */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: 360 }}>
          <div
            className="tv-no-scrollbar h-full overflow-y-auto py-[30px]"
            style={{
              paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe) - 26px)',
              paddingRight: 'calc(var(--tv-safe) - 26px)',
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
        </>
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
