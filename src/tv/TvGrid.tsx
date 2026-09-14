import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import type { Item } from '../v2027/catalog'

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

/** A poster with its title underneath, for the section pages.
 *
 *  2:3, like everything else in this catalogue — the artwork is portrait, and a
 *  16:9 crop of it threw away most of the frame. The caption stays: a grid you
 *  scan deliberately needs its labels, unlike a home rail where the hero above
 *  is already naming whatever is focused. */
export function TvGridCard({
  item,
  focused,
  width = 168,
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
    <div ref={ref} className="tv-scroll-gap shrink-0" style={{ width }}>
      <div
        className={`relative aspect-2/3 overflow-hidden rounded-[12px] bg-tv-raised transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.05]' : ''
        }`}
      >
        {art ? (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className={`size-full object-cover ${key && /^[0-9a-f]{40}$/.test(key) ? 'object-top' : 'object-[center_32%]'} ${
              focused ? '' : 'brightness-[0.74]'
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
      </div>
      <p
        className={`mt-[10px] line-clamp-2 h-[52px] text-[20px]/[26px] font-semibold transition-colors ${
          focused ? 'text-tv-fg' : 'text-tv-dim'
        }`}
      >
        {item.title}
      </p>
    </div>
  )
}
