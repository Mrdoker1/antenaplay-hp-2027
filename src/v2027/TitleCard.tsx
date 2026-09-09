import { useColorFeed } from './colorFeedContext'
import { PlayGlyph } from './PlayGlyph'
import { Badge } from './Badge'
import { CardArt } from './CardArt'
import { Meta } from './Meta'
import { asset } from '../lib/assets'
import type { Item } from './catalog'
import { tidyTitle } from './title'

/** 2:3 card for VOD and franchises.
 *
 *  No border — elevation does the separating. Title and metadata live in the UI
 *  layer under the art, never burnt into it, which is why one type system can
 *  now hold the whole grid together. On hover the card lifts and the metadata
 *  block slides up; the artwork feeds its colour to the page. */
export function TitleCard({
  item,
  width = 232,
  lockup = false,
}: {
  item: Item
  width?: number
  /** Show the title lockup burnt into the key art instead of a caption below.
   *
   *  The house rule is titles in the UI layer — that is what lets one type
   *  system hold the grid together. Top 10 is the deliberate exception: the
   *  Figma file ships a separate lockup for every card in that rail and uses
   *  it, because ranked promo art is a poster, not a catalogue entry. Rendering
   *  both would print the title twice, so this mode drops the caption. */
  lockup?: boolean
}) {
  const { feed } = useColorFeed()
  const lockupSrc = lockup ? asset(item.logo) : null

  return (
    <a
      href="#"
      className="group/card relative block shrink-0 spring transition-transform duration-500 hover:-translate-y-[6px] focus-visible:-translate-y-[6px]"
      style={{ width }}
      onMouseEnter={() => feed(item.title, asset(item.cover))}
      onFocus={() => feed(item.title, asset(item.cover))}
    >
      <div className="art-surface relative aspect-2/3 overflow-hidden rounded-card bg-s2 shadow-[0_2px_10px_rgba(0,0,0,0.35)] spring transition-shadow duration-500 group-hover/card:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.75)]">
        <CardArt
          cover={item.cover}
          title={item.title}
          className="spring transition-transform duration-700 group-hover/card:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
        {item.badge && (
          <div className="absolute left-[10px] top-[10px]">
            <Badge kind={item.badge} />
          </div>
        )}
        {lockup && lockupSrc && (
          <img
            src={lockupSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-x-[15%] bottom-[7.5%] max-h-[34%] w-[70%] object-contain object-bottom"
          />
        )}

        {item.progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-[4px] overflow-hidden bg-white/20">
            <div
              className="h-full bg-brand"
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
        )}

        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-[8px] p-[12px] opacity-0 spring transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <span className="grid size-[34px] place-items-center rounded-full bg-white text-black">
<PlayGlyph className="size-[15px]" />
          </span>
          <span className="grid size-[34px] place-items-center rounded-full border border-white/45 text-white">
            <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </div>

      {/* fixed-height caption: metadata stays on one baseline across the row
          however long the titles are */}
      {!lockup && (
        <div className="h-[74px] pt-[12px]">
          <h3 className="line-clamp-2 h-[42px] text-balance text-[15px]/[21px] font-semibold tracking-[-0.005em] text-fg">
            {tidyTitle(item.title)}
          </h3>
          <Meta className="mt-[4px] truncate">{item.meta}</Meta>
        </div>
      )}
    </a>
  )
}
