import { useMemo } from 'react'
import { asset } from '../lib/assets'
import { titleCount, type Franchise } from '../lib/franchise'
import { TvCard } from './TvCard'
import { usePointerAsRemote, useTvNav } from './useTvNav'

/** A franchise hub.
 *
 *  The argument this screen makes is the one AntenaPLAY can make and a global
 *  streamer cannot: depth it owns. Insula Iubirii is twenty-two titles — ten
 *  Romanian seasons, seven international editions, five companion formats —
 *  and until now they sat scattered across five rails where the scale was
 *  invisible. Gathered, they stop being a show and start being a reason to keep
 *  the subscription through a gap between seasons. */
export function TvFranchiseScreen({
  franchise,
  active,
  onClose,
}: {
  franchise: Franchise
  active: boolean
  onClose: () => void
}) {
  const art = asset(franchise.art)
  const lengths = useMemo(() => franchise.groups.map((g) => g.items.length), [franchise])

  const { focus, setFocus } = useTvNav(lengths, undefined, active, (dir) => {
    if (dir === 'left') onClose()
  })
  const onPointer = usePointerAsRemote(setFocus, undefined, active, onClose)

  const group = franchise.groups[focus.row]
  const item = group?.items[focus.col]

  return (
    <div className="absolute inset-0 z-20 bg-tv-ground" onClick={onPointer}>
      {art && (
        <div className="absolute inset-y-0 right-0 w-[58%] overflow-hidden">
          <img
            src={art}
            alt=""
            className="size-full object-cover object-top"
            style={{
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 24%, #000 56%), linear-gradient(to bottom, #000 40%, transparent 88%)',
              maskComposite: 'intersect',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 24%, #000 56%), linear-gradient(to bottom, #000 40%, transparent 88%)',
              WebkitMaskComposite: 'source-in',
            }}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(97deg,var(--color-tv-ground)_4%,rgba(7,7,10,0.9)_30%,rgba(7,7,10,0.4)_58%,transparent_88%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-tv-ground/85 to-tv-ground" />

      <div
        className="absolute left-0 right-0"
        style={{
          paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe))',
          paddingRight: 'var(--tv-safe)',
          top: 40,
        }}
      >
        <p className="font-meta text-[19px]/[26px] uppercase tracking-[0.18em] text-tv-action">
          Univers
        </p>
        <h1 className="mt-[8px] text-[52px]/[56px] font-black tracking-[-0.03em]">{franchise.name}</h1>
        <p className="mt-[10px] font-meta text-[21px]/[28px] uppercase tracking-[0.1em] text-tv-dim">
          {titleCount(franchise.total)}  ·  {franchise.summary}
        </p>
        {item && (
          <p className="mt-[12px] max-w-[560px] truncate text-[22px]/[28px] font-semibold text-tv-fg">
            {item.title}
          </p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0" style={{ height: 372 }}>
        <div
          className="tv-no-scrollbar h-full overflow-y-auto py-[30px]"
          style={{
            paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe) - 26px)',
            /* No safe-area inset on this side: a rail that stops short of
               the edge reads as a row that has ended, and the last card
               sitting in its own margin looks like a mistake. Running off
               the screen is what says there is more to the right. */
            paddingRight: 0,
            // the row above the fold is sliced by the scrollport; let it
            // dissolve instead of ending on a straight cut
            maskImage: 'linear-gradient(to bottom, transparent 0, #000 26px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 26px)',
          }}
        >
          {franchise.groups.map((g, rowIndex) => (
            <section key={g.label} className="pb-[16px]">
              <h2
                className={`px-[26px] text-[24px]/[30px] font-bold transition-colors ${
                  focus.row === rowIndex ? 'text-tv-fg' : 'text-tv-faint'
                }`}
              >
                {g.label}
                <span className="ms-[12px] font-meta text-[18px] uppercase tracking-[0.12em] text-tv-faint">
                  {g.items.length}
                </span>
              </h2>
              <div className="tv-no-scrollbar -my-[16px] mt-[-6px] flex gap-[16px] overflow-x-auto px-[26px] py-[30px]">
                {g.items.map((it, colIndex) => (
                  <TvCard
                    key={`${it.title}-${colIndex}`}
                    item={it}
                    width={158}
                    focused={focus.row === rowIndex && focus.col === colIndex}
                    cell={`${rowIndex},${colIndex}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
