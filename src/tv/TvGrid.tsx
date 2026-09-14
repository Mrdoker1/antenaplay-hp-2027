import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import type { Item } from '../v2027/catalog'

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

/** A wide card with its title underneath — the shape AntenaPLAY's own TV app
 *  uses for its section pages, and the right one there: a grid you scan
 *  deliberately needs its labels, unlike a home rail where the hero above is
 *  already naming whatever is focused. */
export function TvGridCard({
  item,
  focused,
  width = 236,
}: {
  item: Item
  focused: boolean
  width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const key = item.cover === PLACEHOLDER ? null : item.cover
  const art = asset(key)
  const { a1, a2 } = accentFromTitle(item.title || 'antena')

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focused])

  return (
    <div ref={ref} className="tv-scroll-gap-row shrink-0" style={{ width }}>
      <div
        className={`relative aspect-video overflow-hidden rounded-[12px] bg-tv-raised transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.05]' : ''
        }`}
      >
        {art ? (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className={`size-full object-cover object-top ${focused ? '' : 'brightness-[0.74]'}`}
          />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${a1} / 0.55) 0%, transparent 62%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.45) 0%, transparent 66%)`,
            }}
          />
        )}
      </div>
      <p
        className={`mt-[10px] line-clamp-2 text-[20px]/[26px] font-semibold transition-colors ${
          focused ? 'text-tv-fg' : 'text-tv-dim'
        }`}
      >
        {item.title}
      </p>
    </div>
  )
}
