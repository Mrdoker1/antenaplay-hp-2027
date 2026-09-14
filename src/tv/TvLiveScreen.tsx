import { useMemo } from 'react'
import { canaleTv } from '../data/channels'
import { liveEvents } from '../data/liveEvents'
import { asset } from '../lib/assets'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { useTvNav } from './useTvNav'

/** What is on right now.
 *
 *  This is the one thing a broadcaster has that a global streamer structurally
 *  cannot: six channels going out live. Presented as another shelf of tiles it
 *  reads as more VOD, so here it is a schedule — the channel you are on, what
 *  is playing, how far through it is, and the two things only a broadcaster can
 *  offer: start it from the beginning, or join it where it is.
 *
 *  The programme names and progress are mockup values; the channels and the
 *  events are the real catalogue. */
const NOW = [
  { title: 'Observator', until: '19:00', progress: 0.62 },
  { title: 'Insula Iubirii · Sezonul 10, ep. 14', until: '21:30', progress: 0.18 },
  { title: 'Chefi la cuțite · Sezonul 13', until: '22:00', progress: 0.44 },
  { title: 'Asia Express · Drumul Mătăsii', until: '23:15', progress: 0.71 },
  { title: 'Mireasa · Sezonul 12', until: '20:00', progress: 0.33 },
  { title: 'Neatza cu Răzvan și Dani', until: '12:00', progress: 0.55 },
]

export function TvLiveScreen({ active, onOpenMenu }: { active: boolean; onOpenMenu: () => void }) {
  const channels = useMemo(() => canaleTv.filter((c) => c.logo).slice(0, 10), [])
  const lengths = useMemo(() => [channels.length, liveEvents.length], [channels.length])

  const { focus } = useTvNav(lengths, undefined, active, (dir) => {
    if (dir === 'left') onOpenMenu()
  })

  const channel = channels[focus.row === 0 ? focus.col : 0]
  const now = NOW[(focus.row === 0 ? focus.col : 0) % NOW.length]
  const logo = asset(channel?.logo)

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-tv-ground"
      style={{
        paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe) - 26px)',
        paddingRight: 'calc(var(--tv-safe) - 26px)',
      }}
    >
      <div className="shrink-0 px-[26px] pt-[34px]">
        <h1 className="text-[40px]/[46px] font-black uppercase tracking-[-0.02em] text-tv-action">
          Live
        </h1>

        {/* what is on, on the channel you are standing on */}
        <div className="mt-[16px] flex items-center gap-[22px]">
          {logo && (
            <span className="grid h-[74px] w-[124px] shrink-0 place-items-center rounded-[12px] border border-tv-line bg-tv-raised px-[14px]">
              <img src={logo} alt="" className="max-h-[64%] w-full object-contain" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-[10px] font-meta text-[18px]/[24px] uppercase tracking-[0.14em] text-tv-action">
              <span className="grid size-[8px] place-items-center">
                <span className="size-full animate-ping rounded-full bg-tv-action" />
              </span>
              Acum în direct
            </p>
            <p className="mt-[4px] truncate text-[30px]/[36px] font-bold">{now.title}</p>
            <div className="mt-[10px] flex items-center gap-[14px]">
              <span className="h-[6px] w-[320px] overflow-hidden rounded-full bg-white/15">
                <span
                  className="block h-full rounded-full bg-tv-action"
                  style={{ width: `${Math.round(now.progress * 100)}%` }}
                />
              </span>
              <span className="font-meta text-[18px]/[24px] uppercase tracking-[0.1em] text-tv-dim">
                până la {now.until}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="tv-no-scrollbar min-h-0 flex-1 overflow-y-auto py-[20px]">
        <section className="pb-[10px]">
          <h2
            className={`px-[26px] text-[24px]/[30px] font-bold ${
              focus.row === 0 ? 'text-tv-fg' : 'text-tv-faint'
            }`}
          >
            Canale
          </h2>
          <div className="tv-no-scrollbar -my-[16px] mt-[-4px] flex gap-[16px] overflow-x-auto px-[26px] py-[30px]">
            {channels.map((c, i) => {
              const focused = focus.row === 0 && focus.col === i
              const art = asset(c.logo)
              return (
                <div key={c.name} className="tv-scroll-gap w-[186px] shrink-0">
                  <div
                    className={`grid aspect-video place-items-center rounded-[14px] border border-tv-line bg-tv-raised px-[18px] transition-transform duration-200 ${
                      focused ? 'tv-focus scale-[1.06] bg-tv-panel' : ''
                    }`}
                  >
                    {art && (
                      <img
                        src={art}
                        alt={c.name}
                        loading="lazy"
                        className={`max-h-[70%] w-full object-contain ${focused ? '' : 'opacity-80'}`}
                      />
                    )}
                  </div>
                  {focused && (
                    <div className="mt-[10px] flex items-center gap-[10px]">
                      <span className="flex items-center gap-[7px] rounded-full bg-tv-action px-[14px] py-[6px] text-[17px]/[22px] font-bold">
                        <PlayGlyph className="size-[13px]" />
                        Intră
                      </span>
                      <span className="rounded-full bg-white/12 px-[14px] py-[6px] text-[17px]/[22px] font-semibold">
                        De la început
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2
            className={`px-[26px] text-[24px]/[30px] font-bold ${
              focus.row === 1 ? 'text-tv-fg' : 'text-tv-faint'
            }`}
          >
            Evenimente LIVE
          </h2>
          <div className="tv-no-scrollbar -my-[16px] mt-[-4px] flex gap-[16px] overflow-x-auto px-[26px] py-[30px]">
            {liveEvents.map((e, i) => {
              const focused = focus.row === 1 && focus.col === i
              const still = asset(e.still)
              return (
                <div key={`${e.title}-${i}`} className="tv-scroll-gap w-[248px] shrink-0">
                  <div
                    className={`relative aspect-video overflow-hidden rounded-[12px] bg-tv-raised transition-transform duration-200 ${
                      focused ? 'tv-focus scale-[1.05]' : ''
                    }`}
                  >
                    {still && (
                      <img
                        src={still}
                        alt=""
                        loading="lazy"
                        className={`size-full object-cover ${focused ? '' : 'brightness-[0.74]'}`}
                      />
                    )}
                    <span className="absolute left-[10px] top-[10px] rounded-[6px] bg-black/70 px-[9px] py-[2px] font-meta text-[15px]/[20px] uppercase tracking-[0.1em]">
                      {e.when.split(',')[0]}
                    </span>
                  </div>
                  <p className={`mt-[8px] truncate text-[19px]/[25px] font-semibold ${focused ? 'text-tv-fg' : 'text-tv-dim'}`}>
                    {e.title}
                  </p>
                  <p className="truncate text-[17px]/[23px] text-tv-faint">{e.competition}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
