import { accentFromTitle } from '../v2027/accent'
import type { Item } from '../v2027/catalog'
import { TvCard } from './TvCard'

/** A rail.
 *
 *  `ranked` gives the Top 10 the same treatment as the web skins: the position
 *  as a display-scale numeral filled with that card's own colour, with the
 *  poster overlapping it, and the lockup left on the artwork. It reads even
 *  better here than on a desktop — a number that size is legible from the sofa
 *  in a way a caption never is. */
export function TvRail({
  title,
  items,
  rowIndex,
  focus,
  ranked = false,
}: {
  title: string
  items: Item[]
  rowIndex: number
  focus: { row: number; col: number }
  ranked?: boolean
}) {
  const active = focus.row === rowIndex

  return (
    <section className="pb-[16px]">
      <h2
        className={`px-[26px] text-[24px]/[30px] font-bold tracking-[-0.01em] transition-colors ${
          active ? 'text-tv-fg' : 'text-tv-faint'
        }`}
      >
        {title}
      </h2>

      <div
        className={`tv-no-scrollbar -my-[16px] mt-[-6px] flex overflow-x-auto px-[26px] py-[30px] ${
          ranked ? 'gap-0' : 'gap-[16px]'
        }`}
      >
        {items.map((item, colIndex) =>
          ranked ? (
            <Ranked
              key={`${item.title}-${colIndex}`}
              item={item}
              rank={colIndex + 1}
              focused={active && focus.col === colIndex}
            />
          ) : (
            <TvCard
              key={`${item.title}-${colIndex}`}
              item={item}
              width={168}
              focused={active && focus.col === colIndex}
            />
          ),
        )}
      </div>
    </section>
  )
}

function Ranked({ item, rank, focused }: { item: Item; rank: number; focused: boolean }) {
  const { a1, a2 } = accentFromTitle(item.title || String(rank))

  return (
    <div className="flex shrink-0 items-end" style={{ width: 208 }}>
      <span
        aria-hidden
        className="-me-[26px] select-none bg-clip-text pb-[14px] font-black leading-[0.72] text-transparent"
        style={{
          fontSize: 132,
          letterSpacing: '-0.08em',
          backgroundImage: `linear-gradient(180deg, hsl(${a1} / 0.95) 0%, hsl(${a2} / 0.5) 100%)`,
        }}
      >
        {rank}
      </span>
      <div className="relative z-10">
        <TvCard item={item} width={148} focused={focused} lockup />
      </div>
    </div>
  )
}
