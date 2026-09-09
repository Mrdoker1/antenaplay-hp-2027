import { asset } from '../lib/assets'
import { Badge } from './Badge'
import { Meta } from './Meta'
import { PlayGlyph } from './PlayGlyph'
import { useColorFeed } from './colorFeedContext'
import { accentFromTitle } from './accent'
import type { ChannelItem } from './catalog'

/** A channel tile.
 *
 *  Channels stop being a wall of logos: the tile is a now-playing frame with the
 *  programme name carrying the meaning, and the logo reduced to a corner mark —
 *  a logo alone only works for someone who already knows the brand, which is a
 *  dead shelf for a global audience.
 *
 *  There is no still to show yet, so the frame is the channel's own fed colour.
 *  The mark is set large enough to be the composition's anchor rather than a
 *  stamp in the corner. */
export function ChannelTile({ channel }: { channel: ChannelItem }) {
  const { feed } = useColorFeed()
  const logo = asset(channel.logo)
  const { a1, a2 } = accentFromTitle(channel.name)

  return (
    <a
      href="#"
      className="group/tile relative block w-[286px] shrink-0 spring transition-transform duration-500 hover:-translate-y-[6px] focus-visible:-translate-y-[6px]"
      onMouseEnter={() => feed(channel.name, logo)}
      onFocus={() => feed(channel.name, logo)}
    >
      <div
        className="art-surface relative aspect-video overflow-hidden rounded-tile bg-s2 shadow-[0_2px_10px_rgba(0,0,0,0.35)] spring transition-shadow duration-500 group-hover/tile:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.75)]"
        style={{
          backgroundImage: `radial-gradient(130% 110% at 12% 0%, hsl(${a1} / 0.6) 0%, transparent 68%), radial-gradient(120% 100% at 92% 100%, hsl(${a2} / 0.48) 0%, transparent 70%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {logo && (
          <img
            src={logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className="absolute right-[14px] top-[14px] size-[78px] rounded-[12px] bg-black/40 object-contain p-[9px] backdrop-blur-sm spring transition-transform duration-500 group-hover/tile:scale-[1.06]"
          />
        )}

        {/* The badge and the play affordance share the top-left slot: the
            badge states what the channel is, the play button what you can do
            about it, and only one of those matters while the pointer is on the
            tile. So they cross over rather than crowd each other. */}
        {channel.badge && (
          <div className="absolute left-[12px] top-[12px] transition-opacity duration-300 group-hover/tile:opacity-0">
            <Badge kind={channel.badge} />
          </div>
        )}

        <span className="absolute left-[12px] top-[12px] grid size-[40px] place-items-center rounded-full bg-white/95 text-black opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] spring transition duration-300 group-hover/tile:opacity-100">
          <PlayGlyph className="size-[17px]" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-[14px]">
          <p className="line-clamp-1 text-[15px]/[20px] font-semibold">{channel.name}</p>
          <Meta className="mt-[2px] truncate text-fg-muted">{channel.now}</Meta>
        </div>
      </div>
    </a>
  )
}
