import { useCallback, useEffect, useRef, useState } from 'react'

/** Horizontally scrolling row of cards.
 *
 *  The Figma capture froze this as a clipped strip with a translucent
 *  "Button - Next slide" scrim on the right edge (64.117px, rgba(20,20,20,0.5)).
 *  Here that scrim is live: it pages the rail, and a matching one appears on the
 *  left once you have scrolled away from the start. */
export function Rail({
  children,
  itemPitch,
  height,
  className = '',
}: {
  children: React.ReactNode
  /** distance from one card's left edge to the next, in px */
  itemPitch: number
  /** rail height in px, so the scrim matches the cards exactly */
  height: number
  className?: string
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
    // advance by whole cards so the rail never stops mid-poster
    const cards = Math.max(1, Math.floor(el.clientWidth / itemPitch))
    el.scrollBy({ left: dir * cards * itemPitch, behavior: 'smooth' })
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div
        ref={track}
        onScroll={measure}
        className="no-scrollbar page-gutter flex h-full overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        {children}
      </div>

      <Scrim side="left" hidden={atStart} onClick={() => page(-1)} />
      <Scrim side="right" hidden={atEnd} onClick={() => page(1)} />
    </div>
  )
}

function Scrim({
  side,
  hidden,
  onClick,
}: {
  side: 'left' | 'right'
  hidden: boolean
  onClick: () => void
}) {
  const right = side === 'right'
  return (
    <button
      type="button"
      onClick={onClick}
      hidden={hidden}
      aria-label={right ? 'Următoarele' : 'Anterioarele'}
      className={`absolute top-0 grid h-full w-[64.117px] place-items-center bg-[rgba(20,20,20,0.5)] text-white/90 transition hover:bg-[rgba(20,20,20,0.8)] ${
        right ? 'right-0 rounded-l-[4px]' : 'left-0 rounded-r-[4px]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={right ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
