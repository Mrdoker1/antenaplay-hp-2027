import { asset } from '../lib/assets'
import type { Channel } from '../data/types'
import { Placeholder } from './Placeholder'

/** Figma: 258×152 tile on a 266px pitch, 1px hairline, 4px radius,
 *  150×150 logo centred, red 58×20 badge pinned at 5.84/6px. */
export function ChannelCard({ channel }: { channel: Channel }) {
  const logo = asset(channel.logo)

  return (
    <a
      href="#"
      title={channel.name}
      className="relative block h-[152px] w-[258px] shrink-0 overflow-hidden rounded-[4px] border border-white/20 bg-ink transition hover:border-white/60"
    >
      {logo ? (
        <img
          src={logo}
          alt={channel.name}
          className="absolute left-1/2 top-0 size-[150px] -translate-x-1/2 object-cover"
        />
      ) : (
        <Placeholder className="absolute inset-0 size-full" />
      )}

      {channel.badge && (
        <span className="absolute left-[5.84px] top-[6px] flex h-[20px] items-center rounded-[3px] bg-brand px-[10px] text-[12px]/[18px] tracking-[1px]">
          {channel.badge}
        </span>
      )}
    </a>
  )
}
