import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { PlayGlyph } from '../v2027/PlayGlyph'
import type { Poster } from '../data/types'

/** A row of cards.
 *
 *  Figma 10:2 ends its rows with a circular arrow sitting on the content rather
 *  than a full-height scrim, and 10:74 lets the focused card grow while its
 *  neighbours hold still. Both are kept here. */
export function Rail3({
  title,
  items,
  cardWidth = 196,
  lockup = false,
}: {
  title: string
  items: Poster[]
  cardWidth?: number
  /** show the title lockup on the art instead of a caption underneath */
  lockup?: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

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
    const pitch = cardWidth + 14
    const n = Math.max(1, Math.floor(el.clientWidth / pitch))
    el.scrollBy({ left: dir * n * pitch, behavior: 'smooth' })
  }

  return (
    <section className="group/rail3 mt-[clamp(30px,3vw,52px)]">
      <h2 className="v3-inset text-[clamp(17px,1.35vw,22px)]/[1.3] font-bold tracking-[-0.015em]">{title}</h2>

      <div className="relative mt-[14px]">
        <div
          ref={track}
          onScroll={measure}
          className="v3-no-scrollbar v3-inset flex gap-[14px] overflow-x-auto overflow-y-hidden scroll-smooth pt-[26px] pb-[34px] -mt-[26px] -mb-[24px]"
        >
          {items.map((item, i) => (
            <Card key={`${item.name}-${i}`} item={item} width={cardWidth} lockup={lockup} />
          ))}
        </div>

        <Arrow side="start" hidden={atStart} onClick={() => page(-1)} />
        <Arrow side="end" hidden={atEnd} onClick={() => page(1)} />
      </div>
    </section>
  )
}

const FIGMA_PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'
const isFigmaExport = (key: string) => /^[0-9a-f]{40}$/.test(key)

function Card({ item, width, lockup }: { item: Poster; width: number; lockup: boolean }) {
  const key = item.cover === FIGMA_PLACEHOLDER ? null : item.cover
  const art = asset(key)
  const lockupArt = lockup ? asset(item.logo) : null
  const { a1, a2 } = accentFromTitle(item.name || 'antena')

  return (
    <a
      href="#"
      title={item.name}
      className="group/c3 relative shrink-0 transition-transform duration-400 ease-out hover:scale-[1.05] focus-visible:scale-[1.05]"
      style={{ width }}
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-[10px] bg-v3-raised shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-shadow duration-400 group-hover/c3:shadow-[0_20px_44px_-14px_rgba(0,0,0,0.8)]">
        {art ? (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className={`size-full object-cover ${key && isFigmaExport(key) ? 'object-top' : 'object-[center_32%]'}`}
          />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${a1} / 0.55) 0%, transparent 62%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.45) 0%, transparent 66%)`,
            }}
          />
        )}

        {lockupArt && (
          <img
            src={lockupArt}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-x-[14%] bottom-[7%] max-h-[34%] w-[72%] object-contain object-bottom"
          />
        )}

        <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover/c3:opacity-100">
          <span className="grid size-[42px] place-items-center rounded-full bg-white text-black">
            <PlayGlyph className="size-[17px]" />
          </span>
        </span>
      </div>

      {!lockup && (
        <p className="mt-[9px] line-clamp-2 h-[38px] text-balance text-[13px]/[19px] font-medium text-v3-dim transition-colors group-hover/c3:text-v3-fg">
          {item.name}
        </p>
      )}
    </a>
  )
}

function Arrow({ side, hidden, onClick }: { side: 'start' | 'end'; hidden: boolean; onClick: () => void }) {
  const end = side === 'end'
  return (
    <button
      type="button"
      onClick={onClick}
      hidden={hidden}
      aria-label={end ? 'Următoarele' : 'Anterioarele'}
      className={`absolute top-[36%] z-20 grid size-[38px] -translate-y-1/2 place-items-center rounded-full bg-black/70 text-v3-fg opacity-0 shadow-[0_6px_22px_rgba(0,0,0,0.6)] backdrop-blur-md transition-opacity duration-300 group-hover/rail3:opacity-100 focus-visible:opacity-100 ${
        end ? 'right-[14px]' : 'left-[calc(var(--v3-rail)+14px)]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={end ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
