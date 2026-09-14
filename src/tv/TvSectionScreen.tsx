import { useMemo, useState } from 'react'
import type { Item } from '../v2027/catalog'
import { TvGridCard } from './TvGrid'
import { useTvNav } from './useTvNav'

export type Filter = { label: string; items: Item[] }

/** Portrait posters, so more of them fit across. */
const PER_ROW = 6

/** A section page, in the shape AntenaPLAY's own TV app uses: the section name,
 *  a row of filters, then a grid of wide cards with titles.
 *
 *  The filters narrow by something the catalogue actually knows, rather than by
 *  a label that would sit there doing nothing. */
export function TvSectionScreen({
  title,
  filters,
  active,
  onOpenMenu,
}: {
  title: string
  filters: Filter[]
  active: boolean
  onOpenMenu: () => void
}) {
  const [filter, setFilter] = useState(0)
  const items = useMemo(() => filters[filter]?.items ?? [], [filters, filter])

  const grid = useMemo(() => {
    const out: Item[][] = []
    for (let i = 0; i < items.length; i += PER_ROW) out.push(items.slice(i, i + PER_ROW))
    return out.slice(0, 8)
  }, [items])

  const lengths = useMemo(
    () => [filters.length, ...grid.map((r) => r.length)],
    [filters.length, grid],
  )

  const { focus } = useTvNav(
    lengths,
    ({ row, col }) => {
      // focus is already on the chip that was pressed; only the selection moves
      if (row === 0) setFilter(col)
    },
    active,
    (dir) => {
      if (dir === 'left') onOpenMenu()
    },
  )

  /* The section name and the filters stay put; only the grid moves. Scrolled
     away, they take with them the two things you need most on a page you are
     scanning: where you are, and how to narrow it. */
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-tv-ground"
      style={{
        paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe) - 26px)',
        paddingRight: 'calc(var(--tv-safe) - 26px)',
      }}
    >
      <div className="shrink-0 pt-[34px]">
        <h1 className="px-[26px] text-[40px]/[46px] font-black uppercase tracking-[-0.02em] text-tv-action">
          {title}
        </h1>

        {filters.length > 1 && (
          <div className="tv-no-scrollbar -my-[8px] mt-[10px] flex items-center gap-[20px] overflow-x-auto px-[26px] py-[22px]">
            <span className="shrink-0 font-meta text-[19px]/[26px] uppercase tracking-[0.12em] text-tv-faint">
              Filtrează
            </span>
            {filters.map((f, i) => (
              <span
                key={f.label}
                className={`tv-scroll-gap shrink-0 whitespace-nowrap rounded-full px-[20px] py-[9px] text-[21px]/[28px] font-semibold transition-transform duration-200 ${
                  filter === i ? 'bg-tv-action text-white' : 'bg-white/10 text-tv-dim'
                } ${focus.row === 0 && focus.col === i ? 'tv-focus scale-[1.05]' : ''}`}
              >
                {f.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="tv-no-scrollbar min-h-0 flex-1 overflow-y-auto py-[26px]">
        <div className="flex flex-col gap-[26px]">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-[20px] px-[26px]">
              {row.map((item, colIndex) => (
                <TvGridCard
                  key={`${item.title}-${colIndex}`}
                  item={item}
                  focused={focus.row === rowIndex + 1 && focus.col === colIndex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
