import { useCallback, useEffect, useMemo, useState } from 'react'
import mark from '../assets/antena-mark.svg'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { rows as catalogue, type Item } from '../v2027/catalog'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { tidyTitle } from '../v2027/title'
import { IconSparkle } from '../v3ai/icons'
import { TvCard } from './TvCard'
import { TvSearch } from './TvSearch'
import { TvStage } from './TvStage'
import { useTvNav } from './useTvNav'

const RAILS: { title: string; items: Item[] }[] = [
  { title: 'Continuă de unde ai rămas', items: catalogue.continueWatching },
  { title: 'Trending în AntenaPLAY', items: catalogue.trending },
  { title: 'Top 10 în România', items: catalogue.top10.slice(0, 10) },
  { title: 'AntenaPLAY Sport', items: catalogue.sport },
  { title: 'În curând', items: catalogue.inCurand },
  { title: 'Filme și seriale noi', items: catalogue.filmeSerialeNoi },
]

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

/** AntenaPLAY home page — Smart TV.
 *
 *  Not the web page made bigger. Three things drive the layout, and all three
 *  come from the remote:
 *
 *  - **Focus replaces hover.** Everything the web skins reveal on hover lives
 *    in the focused state, and only the focused card shows it.
 *  - **The backdrop follows focus.** Moving across a row changes the whole
 *    screen behind it, so the detail you would otherwise open a page for is
 *    already in front of you — the cheapest way to cut presses on a device
 *    where every press costs.
 *  - **One row, plus the top of the next.** A remote scrolls a row at a time,
 *    so a screen crammed with rows is a screen you cannot reach the bottom of.
 *
 *  Search gets its own screen because it is the one thing a remote is genuinely
 *  bad at, and therefore the one place an assistant earns its keep. */
export default function TvHome() {
  const [searchOpen, setSearchOpen] = useState(false)

  // row 0 is the top bar; the content rails follow
  const lengths = useMemo(() => [2, ...RAILS.map((r) => r.items.length)], [])

  const onEnter = useCallback(({ row, col }: { row: number; col: number }) => {
    if (row === 0 && col === 1) setSearchOpen(true)
  }, [])

  // the search overlay takes the remote while it is open
  const { focus } = useTvNav(lengths, onEnter, !searchOpen)

  const rail = focus.row > 0 ? RAILS[focus.row - 1] : null
  const item = rail?.items[focus.col] ?? RAILS[0].items[0]
  const artKey = item.cover === PLACEHOLDER ? null : item.cover
  const art = asset(artKey)
  const { a1 } = accentFromTitle(item.title || 'antena')

  useEffect(() => {
    document.documentElement.dataset.skin = 'tv'
    return () => {
      delete document.documentElement.dataset.skin
    }
  }, [])

  return (
    <TvStage>
      {/* the backdrop is whatever is focused */}
      {art ? (
        <img key={artKey} src={art} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(90% 110% at 70% 0%, hsl(${a1} / 0.55), transparent 70%)` }}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(97deg,var(--color-tv-ground)_2%,rgba(7,7,10,0.92)_34%,rgba(7,7,10,0.45)_62%,transparent_92%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-tv-ground/85 to-tv-ground" />

      {/* top bar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center gap-[20px]"
        style={{ paddingInline: 'var(--tv-safe)', paddingTop: 26 }}
      >
        <span className={`flex items-baseline gap-[8px] rounded-[8px] px-[8px] py-[4px] ${focus.row === 0 && focus.col === 0 ? 'tv-focus' : ''}`}>
          <img src={mark} alt="" className="h-[24px] w-auto" />
          <span className="text-[24px]/[28px] font-black tracking-[-0.03em]">
            antena<span className="font-light text-tv-fg/65">PLAY</span>
          </span>
        </span>

        <span
          className={`ms-auto flex items-center gap-[12px] rounded-full bg-white/10 px-[22px] py-[10px] transition-transform duration-200 ${
            focus.row === 0 && focus.col === 1 ? 'tv-focus-ai scale-[1.04]' : ''
          }`}
        >
          <IconSparkle className="size-[24px] text-tv-ai" />
          <span className="text-[22px]/[28px] font-semibold">Caută cu vocea</span>
        </span>

        <span className="font-meta text-[18px]/[24px] uppercase tracking-[0.14em] text-tv-faint">
          ↑ ↓ ← → · OK
        </span>
      </div>

      {/* the focused title, in place of a details page */}
      <div className="absolute left-0 right-0" style={{ paddingInline: 'var(--tv-safe)', top: 96 }}>
        <div className="max-w-[620px]">
          <p className="font-meta text-[19px]/[26px] uppercase tracking-[0.16em] text-tv-dim">
            {rail ? rail.title : 'AntenaPLAY'}
          </p>
          <h1 className="mt-[10px] line-clamp-2 text-[50px]/[54px] font-black tracking-[-0.03em]">
            {tidyTitle(item.title)}
          </h1>
          <p className="mt-[12px] font-meta text-[20px]/[26px] uppercase tracking-[0.1em] text-tv-dim">
            {item.meta}
          </p>
          <div className="mt-[18px] flex items-center gap-[12px]">
            <span className="flex items-center gap-[10px] rounded-full bg-tv-action px-[22px] py-[10px] text-[21px]/[26px] font-bold">
              <PlayGlyph className="size-[20px]" />
              OK · Redă
            </span>
          </div>
        </div>
      </div>

      {/* one row in full, the next peeking — a remote moves a row at a time */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 360 }}>
        <div
          className="tv-no-scrollbar h-full overflow-y-auto"
          style={{ paddingInline: 'var(--tv-safe)' }}
        >
          {RAILS.map((r, rowIndex) => (
            <section key={r.title} className="pb-[22px]">
              <h2
                className={`text-[24px]/[30px] font-bold tracking-[-0.01em] transition-colors ${
                  focus.row === rowIndex + 1 ? 'text-tv-fg' : 'text-tv-faint'
                }`}
              >
                {r.title}
              </h2>
              <div className="tv-no-scrollbar mt-[12px] flex gap-[16px] overflow-x-auto pb-[10px] pt-[8px]">
                {r.items.map((it, colIndex) => (
                  <TvCard
                    key={`${it.title}-${colIndex}`}
                    item={it}
                    width={168}
                    focused={focus.row === rowIndex + 1 && focus.col === colIndex}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {searchOpen && <TvSearch onClose={() => setSearchOpen(false)} />}
    </TvStage>
  )
}
