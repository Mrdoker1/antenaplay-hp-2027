import { asset } from '../lib/assets'
import { Row } from './Row'
import { TitleCard } from './TitleCard'
import type { Item } from './catalog'

/** Franchise takeover.
 *
 *  A defined band, not a fade. The earlier version smeared the key art into the
 *  page with a five-stop gradient at both edges, which just read as mud — so the
 *  art now fills a rectangle with hard top and bottom edges, under one even
 *  scrim that gives every caption in the row the same contrast. Hairlines mark
 *  the two edges so the band reads as deliberate. */
export function Takeover2027({
  title,
  items,
  backdropHash,
}: {
  title: string
  items: Item[]
  backdropHash: string
}) {
  const backdrop = asset(backdropHash)

  return (
    <section className="relative mt-[clamp(40px,4vw,72px)] overflow-hidden border-y border-white/10 py-[clamp(28px,3vw,52px)]">
      {backdrop && (
        <img src={backdrop} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      {/* one even scrim: uniform contrast beats a gradient nobody can aim */}
      <div className="absolute inset-0 bg-[#07070a]/62" />

      <div className="art-surface on-photo relative">
        <Row title={title} itemPitch={248}>
          {items.map((item, i) => (
            <TitleCard key={`${item.title}-${i}`} item={item} />
          ))}
        </Row>
      </div>
    </section>
  )
}
