import { useMemo } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { IconSparkle } from './icons'
import { reading, refinements, stats, SUGGESTIONS, type Hit } from './search'
import type { SmartSearch } from './useSmartSearch'

/** The results page.
 *
 *  The header panel answers a phrase while you type; this is what that answer
 *  becomes when you commit it. It exists because a search that only ever
 *  whispers into a dropdown reads as a mock-up: press Enter, nothing happens,
 *  and a working feature gets written off as a stub.
 *
 *  Two things it does that an ordinary results grid does not. It shows what it
 *  understood — the phrase broken into the signals it actually searched on — so
 *  a wrong answer is debuggable by the person who typed it rather than
 *  mysterious. And every card keeps its reasons, because the argument for
 *  describing instead of naming collapses the moment you cannot tell why
 *  something came back. */
export function SearchResults({ s }: { s: SmartSearch }) {
  const refine = useMemo(() => refinements(s.settled, 8), [s.settled])
  /* what the assistant took from the phrase — moods first, since they are the
     part a title search cannot do at all */
  const read = useMemo(() => reading(s.settled), [s.settled])

  return (
    <div className="v3-results min-h-screen ps-[var(--v3-rail)]">
      <div className="px-[clamp(16px,2.4vw,40px)] pb-[80px] pt-[112px]">
        <div className="flex flex-wrap items-end justify-between gap-[16px] border-b border-white/8 pb-[20px]">
          <div className="min-w-0">
            <p className="flex items-center gap-[8px] text-[12px]/[18px] uppercase tracking-[0.14em] text-v3-ai">
              <IconSparkle className="size-[14px]" />
              Căutare AI
            </p>
            <h1 className="mt-[8px] text-balance text-[clamp(26px,3vw,40px)]/[1.12] font-black tracking-[-0.03em]">
              „{s.settled}"
            </h1>
            <p className="mt-[8px] text-[14px]/[21px] text-v3-dim">
              {s.total} de potriviri în {stats.films} de filme și {stats.shows} de titluri
              AntenaPLAY
              {s.all.length < s.total && ` · cele mai apropiate ${s.all.length}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => s.setExpanded(false)}
            className="shrink-0 rounded-[100px] bg-white/8 px-[18px] py-[10px] text-[13px]/[19px] font-semibold text-v3-fg transition-colors hover:bg-white/16"
          >
            ← Înapoi la pagina principală
          </button>
        </div>

        <div className="grid gap-[clamp(20px,2.4vw,40px)] pt-[24px] lg:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-[26px]">
            {read.length > 0 && (
              <div>
                <h2 className="text-[12px]/[18px] uppercase tracking-[0.12em] text-v3-faint">
                  Am înțeles
                </h2>
                <ul className="mt-[10px] flex flex-wrap gap-[6px]">
                  {read.map((token) => (
                    <li
                      key={token}
                      className="rounded-[6px] bg-v3-ai/14 px-[8px] py-[3px] text-[11px]/[17px] font-medium uppercase tracking-[0.06em] text-v3-ai"
                    >
                      {token}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {refine.length > 0 && (
              <div>
                <h2 className="text-[12px]/[18px] uppercase tracking-[0.12em] text-v3-faint">
                  Restrânge
                </h2>
                <ul className="mt-[10px] flex flex-wrap gap-[8px]">
                  {refine.map((chip) => (
                    <li key={chip.label}>
                      <button
                        type="button"
                        onClick={() => s.setQuery(`${s.settled} ${chip.append}`)}
                        className="rounded-[100px] border border-white/12 px-[13px] py-[6px] text-[13px]/[19px] font-medium text-v3-dim transition-colors first-letter:uppercase hover:border-white/30 hover:text-v3-fg"
                      >
                        + {chip.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-[12px]/[18px] uppercase tracking-[0.12em] text-v3-faint">
                Încearcă altceva
              </h2>
              <ul className="mt-[10px] flex flex-col gap-[6px]">
                {SUGGESTIONS.filter((p) => p !== s.settled).map((phrase) => (
                  <li key={phrase}>
                    <button
                      type="button"
                      onClick={() => s.setQuery(phrase)}
                      className="text-start text-[13px]/[20px] text-v3-dim transition-colors hover:text-v3-fg"
                    >
                      „{phrase}"
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {s.all.length ? (
            <ul className="grid grid-cols-2 gap-[clamp(12px,1.4vw,22px)] md:grid-cols-3 xl:grid-cols-4">
              {s.all.map((hit) => (
                <li key={hit.title}>
                  <ResultCard hit={hit} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="pt-[12px] text-[14px]/[21px] text-v3-faint">
              Nimic nu se potrivește cu „{s.settled}".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ hit }: { hit: Hit }) {
  const art = asset(hit.art)
  const { a1, a2 } = accentFromTitle(hit.title)

  return (
    <a href="#" className="group/res block">
      <div
        className="relative aspect-video overflow-hidden rounded-[14px] bg-v3-raised shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-shadow duration-500 group-hover/res:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.75)]"
        style={{
          backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${a1} / 0.5) 0%, transparent 66%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.42) 0%, transparent 68%)`,
        }}
      >
        {art && (
          <img
            src={art}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top transition-transform duration-500 group-hover/res:scale-[1.05]"
          />
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover/res:opacity-100">
          <span className="grid size-[40px] place-items-center rounded-full bg-white text-black">
            <PlayGlyph className="size-[16px]" />
          </span>
        </span>
      </div>

      <p className="mt-[10px] truncate text-[14px]/[20px] font-semibold text-v3-fg">{hit.title}</p>
      <p className="truncate text-[12px]/[18px] text-v3-dim">{hit.vibe}</p>
      <div className="mt-[6px] flex flex-wrap items-center gap-[5px]">
        {hit.reasons.map((reason) => (
          <span
            key={reason}
            className="rounded-[5px] bg-v3-ai/14 px-[6px] py-[2px] text-[10px]/[15px] font-medium uppercase tracking-[0.06em] text-v3-ai"
          >
            {reason}
          </span>
        ))}
      </div>
    </a>
  )
}
