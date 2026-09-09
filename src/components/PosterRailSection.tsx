import type { Poster } from '../data/types'
import { PosterCard } from './PosterCard'
import { Rail } from './Rail'
import { SectionHeading } from './SectionHeading'

/** Figma: Section = 51.836px lead-in, 58px heading, 4px gap, 437px rail. */
export function PosterRailSection({ title, items }: { title: string; items: Poster[] }) {
  return (
    <section className="pt-[51.836px]">
      <SectionHeading>{title}</SectionHeading>
      <Rail itemPitch={266} height={437} className="mt-[4px]">
        {items.map((poster, i) => (
          <div key={`${poster.name}-${i}`} className="pr-[8px]">
            <PosterCard poster={poster} />
          </div>
        ))}
      </Rail>
    </section>
  )
}
