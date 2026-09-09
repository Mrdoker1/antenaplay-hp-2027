import { asset } from '../lib/assets'
import { Badge } from './Badge'
import { PlayGlyph } from './PlayGlyph'
import { CardArt } from './CardArt'
import { Meta } from './Meta'
import { useColorFeed } from './colorFeedContext'
import type { Item } from './catalog'

/** 16:9 card for live, sport and clips.
 *
 *  Aspect ratio is the signal: anything on this shape is happening now or is a
 *  short-form cut, so broadcast stops looking like just more VOD. Continue
 *  watching uses the same shape and adds the resume bar. */
export function WideCard({ item, width = 372 }: { item: Item; width?: number }) {
  const { feed } = useColorFeed()
  const art = asset(item.cover)

  return (
    <a
      href="#"
      className="group/card relative block shrink-0 spring transition-transform duration-500 hover:-translate-y-[6px] focus-visible:-translate-y-[6px]"
      style={{ width }}
      onMouseEnter={() => feed(item.title, art)}
      onFocus={() => feed(item.title, art)}
    >
      <div className="art-surface relative aspect-video overflow-hidden rounded-card bg-s2 shadow-[0_2px_10px_rgba(0,0,0,0.35)] spring transition-shadow duration-500 group-hover/card:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.75)]">
        <CardArt
          cover={item.cover}
          title={item.title}
          className="spring transition-transform duration-700 group-hover/card:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {item.badge && (
          <div className="absolute left-[12px] top-[12px]">
            <Badge kind={item.badge} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-[14px]">
          <h3 className="line-clamp-1 text-[17px]/[22px] font-semibold tracking-[-0.01em]">
            {item.title}
          </h3>
          <Meta className="mt-[3px] truncate text-fg-muted">{item.meta}</Meta>
        </div>

        {item.progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-[4px] overflow-hidden bg-white/20">
            <div
              className="h-full bg-brand"
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
        )}

        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-400 group-hover/card:opacity-100">
          <span className="grid size-[52px] place-items-center rounded-full bg-white/95 text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
<PlayGlyph className="size-[20px]" />
          </span>
        </span>
      </div>
    </a>
  )
}
