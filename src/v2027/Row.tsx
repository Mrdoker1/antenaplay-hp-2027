import { useCallback, useEffect, useRef, useState } from 'react'

/** A content row.
 *
 *  Three changes from the baseline rail: it bleeds off the right edge so the
 *  row reads as continuing rather than ending in a wall; the pager is a
 *  floating control that appears on hover instead of a permanent full-height
 *  scrim; and the whole row reveals on scroll. */
export function Row({
  title,
  children,
  itemPitch,
  seeAll = true,
}: {
  title: string
  children: React.ReactNode
  itemPitch: number
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
    const cards = Math.max(1, Math.floor(el.clientWidth / itemPitch))
    el.scrollBy({ left: dir * cards * itemPitch, behavior: 'smooth' })
  }

  return (
    <section
      ref={section}
      className={`group/row mt-[clamp(40px,4vw,72px)] reveal ${shown ? 'reveal-in' : ''}`}
    >
      <header className="page-pad flex items-baseline justify-between">
        <h2 className="text-balance text-[clamp(21px,1.7vw,28px)]/[1.25] font-bold tracking-[-0.018em]">
          {title}
        </h2>
        {seeAll && (
          <a
            href="#"
            className="font-meta text-[11px] uppercase tracking-[0.14em] text-fg-faint opacity-0 transition duration-300 hover:text-fg group-hover/row:opacity-100 focus-visible:opacity-100"
          >
            Vezi tot
          </a>
        )}
      </header>

      <div className="relative mt-[18px]">
        <div
          ref={track}
          onScroll={measure}
          className="no-scrollbar -mt-[36px] -mb-[46px] flex gap-[16px] overflow-x-auto overflow-y-hidden pt-[36px] pb-[56px] ps-[clamp(32px,4.6vw,96px)] pe-[clamp(32px,4.6vw,96px)]"
        >
          {children}
        </div>

        <Pager side="start" hidden={atStart} onClick={() => page(-1)} />
        <Pager side="end" hidden={atEnd} onClick={() => page(1)} />
      </div>
    </section>
  )
}

function Pager({
  side,
  hidden,
  onClick,
}: {
  side: 'start' | 'end'
  hidden: boolean
  onClick: () => void
}) {
  const end = side === 'end'
  return (
    <button
      type="button"
      onClick={onClick}
      hidden={hidden}
      aria-label={end ? 'Următoarele' : 'Anterioarele'}
      className={`absolute top-1/2 z-20 grid size-[44px] -translate-y-1/2 place-items-center rounded-full bg-s3/85 text-fg opacity-0 shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-md transition duration-300 hover:bg-s3 group-hover/row:opacity-100 focus-visible:opacity-100 ${
        end ? 'right-[18px]' : 'left-[18px]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={end ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
