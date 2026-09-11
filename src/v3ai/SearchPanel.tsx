import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { IconSparkle } from './icons'
import { SUGGESTIONS, type Hit } from './search'
import type { SmartSearch } from './useSmartSearch'

/** The body of the search surface: example phrases on the left, live results on
 *  the right. Rendered inside the header's own container rather than as a card
 *  floating beneath it, so the bar and the panel are one object. */
export function SearchPanel({ s, onClose }: { s: SmartSearch; onClose: () => void }) {
  return (
    <div className="relative pb-[12px]">
      {/* the assistant's colour as a wash, not as chrome */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(76% 130% at 6% 130%, rgba(160,107,255,0.20) 0%, transparent 62%), radial-gradient(64% 120% at 96% -26%, rgba(234,29,37,0.16) 0%, transparent 58%)',
        }}
        aria-hidden
      />

      <div className="relative grid gap-[clamp(20px,2.4vw,40px)] px-[clamp(18px,2.4vw,36px)] pb-[24px] pt-[22px] lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <h2 className="text-balance text-[clamp(22px,1.9vw,30px)]/[1.2] font-bold tracking-[-0.02em]">
            Ce ai chef să vezi în seara asta?
          </h2>
          <p className="mt-[10px] text-[14px]/[21px] text-v3-dim">
            Descrie starea, nu titlul — „reality cu cupluri", „ceva scurt și amuzant",
            „sport în direct".
          </p>

          <ul className="mt-[18px] flex flex-wrap gap-[10px]">
            {SUGGESTIONS.map((phrase) => (
              <li key={phrase}>
                <button
                  type="button"
                  onClick={() => s.pick(phrase)}
                  className="rounded-[100px] bg-white/8 px-[18px] py-[8px] text-[14px]/[20px] font-semibold text-v3-fg transition-colors hover:bg-white/16"
                >
                  „{phrase}"
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-[8px] font-meta text-[11px] uppercase tracking-[0.14em] text-v3-ai">
              <IconSparkle className={`size-[14px] ${s.thinking ? 'v3-thinking' : ''}`} />
              Căutare AI
            </span>
            {s.total > s.hits.length && (
              <button
                type="button"
                className="rounded-[100px] border border-v3-line px-[14px] py-[6px] font-meta text-[11px] uppercase tracking-[0.12em] text-v3-dim transition-colors hover:text-v3-fg"
              >
                Arată toate ({s.total})
              </button>
            )}
          </div>

          <div className="mt-[16px] min-h-[196px]">
            {!s.query.trim() ? (
              <p className="pt-[18px] text-[14px]/[21px] text-v3-faint">
                Scrie o frază sau alege una dintre sugestii.
              </p>
            ) : s.thinking && !s.hits.length ? (
              <p className="v3-thinking pt-[18px] text-[14px]/[21px] text-v3-ai">Caut în catalog…</p>
            ) : s.hits.length ? (
              <ul className="grid gap-x-[24px] gap-y-[12px] sm:grid-cols-2">
                {s.hits.map((hit) => (
                  <li key={hit.title}>
                    <Result hit={hit} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-[18px] text-[14px]/[21px] text-v3-faint">
                Nimic pentru „{s.query}". Încearcă o descriere mai largă.
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Închide căutarea"
        className="relative mx-auto grid size-[30px] place-items-center rounded-full bg-white/8 text-v3-dim transition-colors hover:bg-white/16 hover:text-v3-fg"
      >
        <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

function Result({ hit }: { hit: Hit }) {
  const art = asset(hit.cover)
  const { a1, a2 } = accentFromTitle(hit.title)

  return (
    <a
      href="#"
      className="group/res flex items-center gap-[14px] rounded-[10px] p-[6px] transition-colors hover:bg-white/6"
    >
      <span
        className="relative aspect-video w-[104px] shrink-0 overflow-hidden rounded-[8px] bg-v3-raised"
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
            className="size-full object-cover object-top transition-transform duration-500 group-hover/res:scale-[1.06]"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px]/[21px] font-semibold text-v3-fg">{hit.title}</span>
        <span className="block truncate text-[13px]/[19px] text-v3-dim">{hit.vibe}</span>
      </span>
    </a>
  )
}
