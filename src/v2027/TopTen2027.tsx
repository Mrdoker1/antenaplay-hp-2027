import { accentFromTitle } from './accent'
import { Row } from './Row'
import { TitleCard } from './TitleCard'
import type { Item } from './catalog'

/** Top 10.
 *
 *  The baseline flooded a whole section in brand red, which is exactly how red
 *  stops meaning anything. Here the section sits on the same surface as the rest
 *  of the page and the ranking is carried typographically: the numeral is a
 *  display-scale glyph, filled with a gradient taken from *its own* title, with
 *  the poster overlapping it. Red goes back to CTA, LIVE and focus only.
 *
 *  Tinting each numeral from its own card rather than from the hovered one is
 *  deliberate: it means something (this title, this colour) and it holds still
 *  while the pointer moves.
 *
 *  This is also the one rail that keeps the title lockup on the artwork, the
 *  way the Figma file sets it — ranked promo art is a poster, not a catalogue
 *  entry — so the cards carry no caption and the numeral bottom-aligns to the
 *  poster itself. */
export function TopTen2027({ title, items }: { title: string; items: Item[] }) {
  return (
    <Row title={title} itemPitch={300} seeAll={false}>
      {items.slice(0, 10).map((item, i) => {
        const { a1, a2 } = accentFromTitle(item.title || item.cover || String(i))
        return (
          <div key={`${item.title}-${i}`} className="flex shrink-0 items-end">
            {/* numeral bottom-aligns to the artwork, clearing the caption, and
                is painted behind the poster */}
            <span
              aria-hidden
              className="-me-[34px] select-none bg-clip-text pb-[20px] font-black leading-[0.72] tracking-[-0.08em] text-transparent"
              style={{
                fontSize: 'clamp(120px, 13vw, 210px)',
                backgroundImage: `linear-gradient(180deg, hsl(${a1} / 0.95) 0%, hsl(${a2} / 0.5) 100%)`,
              }}
            >
              {i + 1}
            </span>
            <div className="relative z-10">
              <TitleCard item={item} width={214} lockup />
            </div>
          </div>
        )
      })}
    </Row>
  )
}
