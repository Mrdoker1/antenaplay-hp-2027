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
 *  The mark sits on a plate, which is what made it look crooked before: the
 *  artwork shipped as a square with the logo floating inside a lot of nothing,
 *  so the plate framed the padding rather than the mark. With the marks cropped
 *  to their ink (scripts/trim-channel-logos) the plate holds the logo itself. */
export function TvChannelTile({
  channel,
  focused,
  /* Wide enough that a channel's programme line and its name both fit whole:
     at 232 the extra breathing room inside cost "Asia Express NonStop" its
     last word, and a name that needs an ellipsis is not a name. */
  width = 246,
  cell,
}: {
  channel: ChannelItem
  focused: boolean
  width?: number
  /** "row,col" — lets a click stand in for moving here and pressing OK */
  cell?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const logo = asset(channel.logo)
  const { a1, a2 } = accentFromTitle(channel.name)

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focused])

  return (
    <div
      ref={ref}
      data-tv={cell}
      className={`tv-scroll-gap-row shrink-0 ${cell ? 'cursor-pointer' : ''}`}
      style={{ width }}
    >
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
            className={`absolute right-[14px] top-[14px] size-[62px] rounded-[12px] bg-black/45 object-contain p-[9px] transition-opacity duration-200 ${
              focused ? 'opacity-100' : 'opacity-80'
            }`}
          />
        )}

        {channel.badge === 'live' && (
          <span className="absolute left-[14px] top-[14px] flex items-center gap-[6px] rounded-[6px] bg-tv-action px-[9px] py-[3px] font-meta text-[14px]/[18px] uppercase tracking-[0.1em]">
            <span className="size-[7px] rounded-full bg-white" />
            Live
          </span>
        )}
        {channel.badge === 'free' && (
          <span className="absolute left-[14px] top-[14px] rounded-[6px] bg-white/85 px-[9px] py-[3px] font-meta text-[14px]/[18px] uppercase tracking-[0.1em] text-tv-ground">
            Gratuit
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-[17px]">
          <p
            className={`line-clamp-1 text-[20px]/[26px] font-semibold transition-colors duration-200 ${
              focused ? 'text-tv-fg' : 'text-tv-fg/80'
            }`}
          >
            {tidyTitle(channel.name)}
          </p>
          {/* Sentence case, not the meta face in caps. Caps is for a label —
              "LIVE", "GRATUIT" — and this is a sentence: a programme name and
              a time. Set as a label it shouts, loses its own capitals, and
              runs out of room sooner, which is how "Insula Iubirii · S10 E14"
              became "INSULA IUBIRII · …". */}
          <p className="mt-[4px] truncate text-[16px]/[22px] text-tv-dim">{channel.now}</p>
        </div>
      </div>
    </div>
  )
}
