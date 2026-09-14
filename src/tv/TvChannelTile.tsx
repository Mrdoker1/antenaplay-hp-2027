import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'
import type { Channel } from '../data/types'

/** A channel tile, as AntenaPLAY's own TV app shows them: the logo on a dark
 *  plate rather than a still. Here the plate is what carries focus, so an
 *  unfocused row of logos stays quiet instead of competing with the artwork
 *  above it. */
export function TvChannelTile({
  channel,
  focused,
  width = 190,
}: {
  channel: Channel
  focused: boolean
  width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const logo = asset(channel.logo)

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focused])

  return (
    <div ref={ref} className="tv-scroll-gap-row shrink-0" style={{ width }}>
      <div
        className={`relative grid aspect-video place-items-center rounded-[14px] border border-tv-line bg-tv-raised px-[18px] transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.06] bg-tv-panel' : ''
        }`}
      >
        {logo ? (
          <img
            src={logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className={`max-h-[72%] w-full object-contain ${focused ? '' : 'opacity-80'}`}
          />
        ) : (
          <span className="text-center text-[19px]/[24px] font-semibold">{channel.name}</span>
        )}

        {channel.badge === 'Live' && (
          <span className="absolute left-[10px] top-[10px] rounded-[6px] bg-tv-action px-[8px] py-[2px] font-meta text-[14px]/[20px] uppercase tracking-[0.1em]">
            Live
          </span>
        )}
      </div>
    </div>
  )
}
