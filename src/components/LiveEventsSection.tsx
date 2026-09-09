import { backdrops } from '../data/backdrops'
import { liveEvents } from '../data/liveEvents'
import { asset } from '../lib/assets'
import { Rail } from './Rail'

/** Figma: full-bleed backdrop (node 1:1807), 1400px-wide centred column,
 *  cards 344×324 on a 352px pitch — 193.5px still with a 50px play button,
 *  130px caption block, and a 110×24 time ribbon on the top-left corner. */
export function LiveEventsSection() {
  const backdrop = asset(backdrops.liveEvents)

  return (
    <section className="relative mt-[51.836px] overflow-hidden py-[103.68px]">
      {backdrop ? (
        <img src={backdrop} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#12233d_0%,#080d16_60%,#050505_100%)]" />
      )}
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative mx-auto w-full max-w-[1400px] px-[24px]">
        <h2 className="text-[34.56px]/[57.024px] font-bold tracking-[0.2px]">Evenimente LIVE</h2>

        <Rail itemPitch={352} height={324} className="mt-[4px] [--spacing-gutter:0px]">
          {liveEvents.map((event, i) => (
            <div key={`${event.title}-${event.when}-${i}`} className="pr-[8px]">
              <article className="relative h-[324px] w-[344px] shrink-0 overflow-hidden rounded-[4px] bg-ink-raised">
                <div className="relative h-[193.5px] overflow-hidden bg-black/40">
                  {asset(event.still) && (
                    <img src={asset(event.still)!} alt="" className="absolute inset-0 size-full object-cover" />
                  )}
                  {/* play affordance, Figma 50×50 centred at 147/72 */}
                  <span className="absolute left-1/2 top-1/2 grid size-[50px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70">
                    <svg viewBox="0 0 24 24" className="ml-[3px] size-[20px] fill-white" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>

                <div className="px-[16px] pt-[11px] text-center">
                  <p className="text-[19px]/[27px] font-semibold">{event.title}</p>
                  <p className="text-[15px]/[21px] text-muted">{event.competition}</p>
                </div>

                <span className="absolute left-0 top-0 flex h-[24px] w-[110px] items-center bg-brand pl-[15px] text-[13px]/[20px] font-semibold">
                  {event.when.split(',')[0]}
                </span>
                <span className="absolute right-0 top-0 flex h-[24px] items-center bg-black/70 px-[10px] text-[13px]/[20px]">
                  {event.when.split(',').slice(1).join(',').trim()}
                </span>
              </article>
            </div>
          ))}
        </Rail>
      </div>
    </section>
  )
}
