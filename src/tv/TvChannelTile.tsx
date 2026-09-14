import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { tidyTitle } from '../v2027/title'
import type { ChannelItem } from '../v2027/catalog'

/** A channel tile — the same composition the 2027 web skin uses.
 *
 *  A wall of logos is a dead shelf: it only works for someone who already knows
 *  the brand, and it tells nobody what is on. So the tile is a now-playing frame
 *  — the programme carries the meaning, the logo is reduced to a corner mark,
 *  and the frame takes the channel's own fed colour because there is no still.
 *
 *  What differs from the pointer version is only what focus is for: there is no
 *  hover state to reveal a play button, so focus itself brightens the frame and
 *  the mark, and the name goes from dimmed to full.
 *
 *  The mark sits on the frame with no plate behind it. A dark square around a
 *  logo that is already light reads as a second, crooked box inside the card;
 *  a drop shadow does the same legibility job without drawing an edge. The box
 *  is sized by height with the width left to follow, because the marks are
 *  cropped to their ink — so each one is as large as the corner allows. */
export function TvChannelTile({
  channel,
  focused,
  width = 232,
}: {
  channel: ChannelItem
  focused: boolean
  width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const logo = asset(channel.logo)
  const { a1, a2 } = accentFromTitle(channel.name)

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focused])

  return (
    <div ref={ref} className="tv-scroll-gap-row shrink-0" style={{ width }}>
      <div
        className={`relative aspect-video overflow-hidden rounded-[14px] transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.06]' : ''
        }`}
        style={{
          backgroundImage: `radial-gradient(130% 110% at 12% 0%, hsl(${a1} / ${focused ? 0.72 : 0.5}) 0%, transparent 68%), radial-gradient(120% 100% at 92% 100%, hsl(${a2} / ${focused ? 0.58 : 0.4}) 0%, transparent 70%)`,
          backgroundColor: 'var(--color-tv-raised)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        {logo && (
          <img
            src={logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className={`absolute right-[12px] top-[12px] h-[38px] w-auto max-w-[104px] object-contain object-right drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] transition-opacity duration-200 ${
              focused ? 'opacity-100' : 'opacity-80'
            }`}
          />
        )}

        {channel.badge === 'live' && (
          <span className="absolute left-[12px] top-[12px] flex items-center gap-[6px] rounded-[6px] bg-tv-action px-[9px] py-[3px] font-meta text-[14px]/[18px] uppercase tracking-[0.1em]">
            <span className="size-[7px] rounded-full bg-white" />
            Live
          </span>
        )}
        {channel.badge === 'free' && (
          <span className="absolute left-[12px] top-[12px] rounded-[6px] bg-white/85 px-[9px] py-[3px] font-meta text-[14px]/[18px] uppercase tracking-[0.1em] text-tv-ground">
            Gratuit
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-[14px]">
          <p
            className={`line-clamp-1 text-[20px]/[26px] font-semibold transition-colors duration-200 ${
              focused ? 'text-tv-fg' : 'text-tv-fg/80'
            }`}
          >
            {tidyTitle(channel.name)}
          </p>
          <p className="mt-[2px] truncate font-meta text-[16px]/[22px] uppercase tracking-[0.1em] text-tv-dim">
            {channel.now}
          </p>
        </div>
      </div>
    </div>
  )
}
