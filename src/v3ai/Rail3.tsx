import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import type { Item } from '../v2027/catalog'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { tidyTitle } from '../v2027/title'
import { Badge3 } from './Badge3'

/** A content row, on the anatomy the second skin settled on: 232px cards on a
 *  2:3 crop, no borders, the lift and shadow doing the separating, hover
 *  actions sliding up from the card's bottom edge, and a fixed-height caption
 *  so metadata sits on one baseline however long the titles run.
 *
 *  What differs here is only what this skin's layout requires: the track is
 *  inset past the left icon rail, and the pagers are placed against that inset
 *  rather than the page edge. */
export function Rail3({
  title,
  items,
  cardWidth = 232,
  lockup = false,
  seeAll = true,
}: {
  title: string
  items: Item[]
  cardWidth?: number
  /** show the title lockup on the art instead of a caption underneath */
  lockup?: boolean
  seeAll?: boolean
}) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    setAtStart(el.scrollLeft < 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const pitch = cardWidth + 16
    const n = Math.max(1, Math.floor(el.clientWidth / pitch))
    el.scrollBy({ left: dir * n * pitch, behavior: 'smooth' })
  }

  return (
    <section
      ref={section}
      className={`group/row mt-[clamp(34px,3.4vw,60px)] reveal ${shown ? 'reveal-in' : ''}`}
    >
      <header className="v3-inset flex items-baseline justify-between">
        <h2 className="text-balance text-[clamp(21px,1.7vw,28px)]/[1.25] font-bold tracking-[-0.018em]">
          {title}
        </h2>
        {seeAll && (
          <a
            href="#"
            className="font-meta text-[11px] uppercase tracking-[0.14em] text-v3-faint opacity-0 transition duration-300 hover:text-v3-fg group-hover/row:opacity-100 focus-visible:opacity-100"
          >
            Vezi tot
          </a>
        )}
      </header>

      <div className="relative mt-[18px]">
        {/* the track is padded so the hover lift and the card shadow are not
            clipped — overflow clips at the padding box, so the room has to be
            padding, with the margin pulled back to keep the outer rhythm */}
        <div
          ref={track}
          onScroll={measure}
          className="v3-no-scrollbar v3-inset -mt-[36px] -mb-[46px] flex gap-[16px] overflow-x-auto overflow-y-hidden scroll-smooth pt-[36px] pb-[56px]"
        >
          {items.map((item, i) => (
            <Card key={`${item.title}-${i}`} item={item} width={cardWidth} lockup={lockup} />
          ))}
        </div>

        <Pager side="start" hidden={atStart} onClick={() => page(-1)} />
        <Pager side="end" hidden={atEnd} onClick={() => page(1)} />
      </div>
    </section>
  )
}

const FIGMA_PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'
const isFigmaExport = (key: string) => /^[0-9a-f]{40}$/.test(key)

function Card({ item, width, lockup }: { item: Item; width: number; lockup: boolean }) {
  const key = item.cover === FIGMA_PLACEHOLDER ? null : item.cover
  const art = asset(key)
  const lockupArt = lockup ? asset(item.logo) : null
  const { a1, a2 } = accentFromTitle(item.title || 'antena')

  return (
    <a
      href="#"
      title={item.title}
      className="group/card relative block shrink-0 transition-transform duration-500 ease-out hover:-translate-y-[6px] focus-visible:-translate-y-[6px]"
      style={{ width }}
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-[14px] bg-v3-raised shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-shadow duration-500 group-hover/card:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.8)]">
        {art ? (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className={`size-full object-cover transition-transform duration-700 group-hover/card:scale-[1.06] ${
              key && isFigmaExport(key) ? 'object-top' : 'object-[center_32%]'
            }`}
          />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${a1} / 0.55) 0%, transparent 62%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.45) 0%, transparent 66%)`,
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

        {item.badge && (
          <div className="absolute left-[10px] top-[10px]">
            <Badge3 kind={item.badge} />
          </div>
        )}

        {lockupArt && (
          <img
            src={lockupArt}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-x-[15%] bottom-[7.5%] max-h-[34%] w-[70%] object-contain object-bottom"
          />
        )}

        {item.progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-[4px] overflow-hidden bg-white/20">
            <div
              className="h-full bg-v3-action"
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
        )}

        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-[8px] p-[12px] opacity-0 transition-all duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <span className="grid size-[34px] place-items-center rounded-full bg-white text-black">
            <PlayGlyph className="size-[15px]" />
          </span>
          <span className="grid size-[34px] place-items-center rounded-full border border-white/45 text-white">
            <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </div>

      {!lockup && (
        <div className="h-[74px] pt-[12px]">
          <h3 className="line-clamp-2 h-[42px] text-balance text-[15px]/[21px] font-semibold tracking-[-0.005em] text-v3-fg">
            {tidyTitle(item.title)}
          </h3>
          <p className="mt-[4px] truncate font-meta text-[11px] uppercase tracking-[0.13em] text-v3-faint">
            {item.meta}
          </p>
        </div>
      )}
    </a>
  )
}

function Pager({ side, hidden, onClick }: { side: 'start' | 'end'; hidden: boolean; onClick: () => void }) {
  const end = side === 'end'
  return (
    <button
      type="button"
      onClick={onClick}
      hidden={hidden}
      aria-label={end ? 'Următoarele' : 'Anterioarele'}
      className={`absolute top-1/2 z-20 grid size-[44px] -translate-y-1/2 place-items-center rounded-full bg-v3-raised/85 text-v3-fg opacity-0 shadow-[0_8px_28px_rgba(0,0,0,0.6)] backdrop-blur-md transition duration-300 hover:bg-v3-raised group-hover/row:opacity-100 focus-visible:opacity-100 ${
        end ? 'right-[18px]' : 'left-[calc(var(--v3-rail)+18px)]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={end ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
