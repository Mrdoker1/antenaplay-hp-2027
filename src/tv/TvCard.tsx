import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import type { Item } from '../v2027/catalog'

const PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

/** A card on a TV.
 *
 *  Everything the web skins put behind hover lives in the focused state here,
 *  and only for the focused card: the title, the metadata and the actions. An
 *  unfocused card is artwork alone, which is what keeps a wall of them
 *  readable from three metres. */
export function TvCard({
  item,
  focused,
  width = 148,
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
    <div ref={ref} className="shrink-0" style={{ width }}>
      <div
        className={`relative aspect-2/3 overflow-hidden rounded-[10px] bg-tv-raised transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.08]' : ''
        }`}
      >
        {art ? (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className={`size-full object-cover ${key && /^[0-9a-f]{40}$/.test(key) ? 'object-top' : 'object-[center_32%]'} ${
              focused ? '' : 'brightness-[0.72]'
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
        {item.progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-[5px] bg-white/25">
            <div className="h-full bg-tv-action" style={{ width: `${Math.round(item.progress * 100)}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
