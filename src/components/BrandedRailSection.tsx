import type { Poster } from '../data/types'
import { asset } from '../lib/assets'
import { PosterCard } from './PosterCard'
import { Rail } from './Rail'

/** Figma node 1:2177 — a franchise takeover: full-bleed key art behind a
 *  1382px-wide centred column of 270×456 posters on a 278px pitch. */
export function BrandedRailSection({
  title,
  items,
  backdropHash,
  fallbackClass = 'bg-[radial-gradient(120%_110%_at_50%_0%,#0d4f6b_0%,#08222f_65%,#050505_100%)]',
}: {
  title: string
  items: Poster[]
  backdropHash: string
  fallbackClass?: string
}) {
  const backdrop = asset(backdropHash)

  return (
    <section className="relative overflow-hidden py-[104px]">
      {backdrop ? (
        <img src={backdrop} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className={`absolute inset-0 ${fallbackClass}`} />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto w-full max-w-[1382px] px-[24px]">
        <h2 className="text-[34.56px]/[57.024px] font-bold tracking-[0.2px]">{title}</h2>

        <Rail itemPitch={278} height={456} className="mt-[4px] [--spacing-gutter:0px]">
          {items.map((poster, i) => (
            <div key={`${poster.name}-${i}`} className="pr-[8px]">
              <PosterCard poster={poster} width={270} height={456} />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  )
}
