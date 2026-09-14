import { useMemo } from 'react'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { IconSparkle } from './icons'
import { refinements, stats, SUGGESTIONS, type Hit } from './search'
import type { SmartSearch } from './useSmartSearch'

/** The body of the search surface.
 *
 *  Laid out so there is one obvious thing happening: the phrase on the left,
 *  what it found on the right, and nothing competing with either. Earlier this
 *  read as four things at once — a heading, a set of presets, an AI label and a
 *  result list — with no line connecting them.
 *
 *  Three changes do most of that work. The results carry their own header, so
 *  they are visibly an answer to the phrase rather than a separate panel. The
 *  chips stop being decoration and become the next move: presets before a
 *  search, narrowings after one, generated from what the matches actually
 *  contain. And every result says why it matched, because an assistant that
 *  cannot explain itself is only a filter with a nicer font. */
export function SearchPanel({ s, onClose }: { s: SmartSearch; onClose: () => void }) {
  const searched = Boolean(s.settled)
  const refine = useMemo(() => (searched ? refinements(s.settled) : []), [s.settled, searched])

  return (
    <div className="relative pb-[14px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(76% 130% at 6% 130%, rgba(160,107,255,0.18) 0%, transparent 62%), radial-gradient(64% 120% at 96% -26%, rgba(234,29,37,0.14) 0%, transparent 58%)',
        }}
        aria-hidden
      />

      <div className="relative grid gap-[clamp(20px,2.6vw,44px)] px-[clamp(18px,2.2vw,32px)] pb-[20px] pt-[18px] lg:grid-cols-[minmax(260px,0.56fr)_minmax(0,1fr)]">
        {/* the phrase and what to do with it next */}
        <div className="flex flex-col">
          <h2 className="text-balance text-[clamp(20px,1.7vw,27px)]/[1.2] font-bold tracking-[-0.02em]">
            {searched ? 'Rafinează căutarea' : 'Ce ai chef să vezi în seara asta?'}
          </h2>
          <p className="mt-[8px] text-[13px]/[20px] text-v3-dim">
            {searched
              ? 'Adaugă un cuvânt și rezultatele se restrâng.'
              : 'Descrie starea, nu titlul — în română sau în engleză.'}
          </p>

          <ul className="mt-[14px] flex flex-wrap gap-[8px]">
            {(searched && refine.length ? refine : SUGGESTIONS.map((p) => ({ label: p, append: p }))).map(
              (chip) => {
                const active = !searched && s.query.trim() === chip.append
                return (
                  <li key={chip.label}>
                    <button
                      type="button"
                      onClick={() =>
                        searched ? s.setQuery(`${s.settled} ${chip.append}`) : s.pick(chip.append)
                      }
                      className={`rounded-[100px] border px-[14px] py-[7px] text-[13px]/[19px] font-medium transition-colors first-letter:uppercase ${
                        active
                          ? 'border-v3-ai/60 bg-v3-ai/14 text-v3-fg'
                          : 'border-transparent bg-white/6 text-v3-dim hover:bg-white/12 hover:text-v3-fg'
                      }`}
                    >
                      {searched ? `+ ${chip.label}` : chip.label}
                    </button>
                  </li>
                )
              },
            )}
          </ul>

          {/* the column would otherwise end in a void, and this is the thing
              worth saying there: the search runs over a real catalogue */}
          <p className="mt-auto pt-[18px] text-[12px]/[18px] text-v3-faint">
            Caută în {stats.films} de filme și {stats.shows} de titluri AntenaPLAY — după gen, an,
            țară și stare, nu doar după nume.
          </p>
        </div>

        {/* the answer */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-[16px]">
            <div className="min-w-0">
              <p className="flex items-center gap-[7px] text-[12px]/[18px] text-v3-faint">
                <IconSparkle className={`size-[13px] text-v3-ai ${s.thinking ? 'v3-thinking' : ''}`} />
                {s.thinking
                  ? 'Caut în catalog…'
                  : searched
                    ? `AI a găsit ${s.total} potriviri`
                    : 'Recomandări AI'}
              </p>
              {searched && (
                <h3 className="mt-[3px] truncate text-[16px]/[22px] font-semibold text-v3-fg">
                  Potriviri pentru „{s.settled}"
                </h3>
              )}
            </div>
            {searched && s.total > s.hits.length && (
              <button
                type="button"
                className="shrink-0 text-[12px]/[18px] text-v3-faint transition-colors hover:text-v3-fg"
              >
                Vezi tot catalogul →
              </button>
            )}
          </div>

          <div className="mt-[14px] min-h-[210px]">
            {!s.query.trim() ? (
              <p className="pt-[16px] text-[13px]/[20px] text-v3-faint">
                Scrie o frază sau alege una dintre sugestii.
              </p>
            ) : s.thinking && !s.hits.length ? (
              <ul className="grid gap-[10px] sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <li key={i} className="flex items-center gap-[12px] p-[8px]">
                    <span className="v3-thinking aspect-video w-[160px] shrink-0 rounded-[12px] bg-white/8" />
                    <span className="min-w-0 flex-1">
                      <span className="v3-thinking block h-[13px] w-3/4 rounded-full bg-white/8" />
                      <span className="v3-thinking mt-[7px] block h-[11px] w-1/2 rounded-full bg-white/6" />
                    </span>
                  </li>
                ))}
              </ul>
            ) : s.hits.length ? (
              <ul className="grid gap-[10px] sm:grid-cols-2">
                {s.hits.map((hit) => (
                  <li key={hit.title}>
                    <Result hit={hit} onMore={() => s.setQuery(hit.title)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="pt-[16px]">
                <p className="text-[13px]/[20px] text-v3-faint">
                  Nimic nu se potrivește cu „{s.query}".
                </p>
                <button
                  type="button"
                  onClick={() => s.pick(SUGGESTIONS[0])}
                  className="mt-[10px] rounded-[100px] bg-white/8 px-[14px] py-[7px] text-[13px]/[19px] font-medium text-v3-fg transition-colors hover:bg-white/16"
                >
                  Încearcă {SUGGESTIONS[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Închide căutarea"
        className="relative mx-auto grid size-[28px] place-items-center rounded-full bg-white/8 text-v3-dim transition-colors hover:bg-white/16 hover:text-v3-fg"
      >
        <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

function Result({ hit, onMore }: { hit: Hit; onMore: () => void }) {
  const art = asset(hit.art)
  const { a1, a2 } = accentFromTitle(hit.title)

  return (
    <div className="group/res flex items-center gap-[12px] rounded-[14px] p-[8px] transition-colors hover:bg-white/4">
      <a
        href="#"
        className="relative aspect-video w-[160px] shrink-0 overflow-hidden rounded-[12px] bg-v3-raised"
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
          <span className="grid size-[34px] place-items-center rounded-full bg-white text-black">
            <PlayGlyph className="size-[14px]" />
          </span>
        </span>
      </a>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px]/[20px] font-semibold text-v3-fg">{hit.title}</p>
        <p className="truncate text-[12px]/[18px] text-v3-dim">{hit.vibe}</p>

        {/* why it matched — swapped for the actions once the pointer is here */}
        <div className="relative mt-[6px] h-[20px]">
          <div className="absolute inset-0 flex items-center gap-[5px] transition-opacity duration-200 group-hover/res:opacity-0">
            {hit.reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-[5px] bg-v3-ai/14 px-[6px] py-[2px] text-[10px]/[15px] font-medium uppercase tracking-[0.06em] text-v3-ai"
              >
                {reason}
              </span>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center gap-[10px] opacity-0 transition-opacity duration-200 group-hover/res:opacity-100">
            <button type="button" className="text-[11px]/[16px] text-v3-dim transition-colors hover:text-v3-fg">
              + Listă
            </button>
            <button
              type="button"
              onClick={onMore}
              className="text-[11px]/[16px] text-v3-dim transition-colors hover:text-v3-fg"
            >
              Altele ca acesta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
