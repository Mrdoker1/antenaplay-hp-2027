import type { Poster } from '../data/types'
import { PosterCard } from './PosterCard'
import { Rail } from './Rail'
import { SectionHeading } from './SectionHeading'

/** Figma: 291×493 posters on a 356.66px pitch over a deep-red wash, with a
 *  120px rank numeral right-aligned to each poster's left edge (overlapping it
 *  by ~11px) and sitting 20px off the card's bottom.
 *
 *  In the Figma capture those numerals render invisible — the source page draws
 *  them as outlines and the export lost the stroke — so they are restored here
 *  as outlined numerals at the exact geometry the file specifies. */
export function TopTenSection({ title, items }: { title: string; items: Poster[] }) {
  return (
    <section className="mt-[51.836px] bg-top-ten pt-[69.117px] pb-[45px]">
      <SectionHeading>{title}</SectionHeading>
      <Rail itemPitch={356.66} height={493} className="mt-[24px]">
        {items.map((poster, i) => (
          <div
            key={`${poster.name}-${i}`}
            className="relative shrink-0"
            style={{ width: 356.66 }}
          >
            {/* numeral right-aligned 11px into the poster's left edge, 20px
                off the card bottom, painted behind the artwork */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[20px] left-[11px] z-0 -translate-x-full select-none text-[120px]/[120px] font-bold text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.3)]"
            >
              {i + 1}
            </span>
            <div className="relative z-10">
              <PosterCard poster={poster} width={291} height={493} />
            </div>
          </div>
        ))}
      </Rail>
    </section>
  )
}
