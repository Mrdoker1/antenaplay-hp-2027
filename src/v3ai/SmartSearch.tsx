import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { IconSparkle } from './icons'
import { countMatches, search, SUGGESTIONS, type Hit } from './search'

const THINK_MS = 260

/** Natural-language catalogue search — the feature this version is built around.
 *
 *  Modelled on Figma 12:1530 / 12:1866: a pill field in the floating header
 *  that expands into a full-width panel with example phrases on the left and
 *  live results on the right. The field's resting and focused states, the cyan
 *  ring and its glow are the values from that file.
 *
 *  The matching is real (see search.ts) and runs on the actual catalogue, so
 *  typing "reality cu cupluri" or "sport în direct" answers rather than
 *  pretends to. The short thinking beat is deliberate: a result set that
 *  appears on the same frame as the keystroke reads as a filter, and the point
 *  is that this is meant to read as an assistant. */
export function SmartSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('')
  /** The phrase the results currently answer. It trails `query` by one beat, so
   *  "thinking" is simply the gap between the two rather than a third piece of
   *  state to keep in sync. */
  const [settled, setSettled] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = query.trim()
    const t = setTimeout(() => setSettled(q), q ? THINK_MS : 0)
    return () => clearTimeout(t)
  }, [query])

  const hits = useMemo<Hit[]>(() => (settled ? search(settled, 6) : []), [settled])
  const total = useMemo(() => (settled ? countMatches(settled) : 0), [settled])
  const thinking = query.trim() !== settled

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  // "/" opens it from anywhere, Escape closes — the shortcuts a viewer who
  // lives in search will reach for
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        onOpenChange(true)
      }
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onOpenChange])

  const pick = useCallback((phrase: string) => {
    setQuery(phrase)
    input.current?.focus()
  }, [])

  return (
    <>
      {/* the field itself, living in the header pill */}
      <div
        className={`flex h-[56px] min-w-0 flex-1 items-center gap-[12px] rounded-[100px] px-[24px] transition-all duration-300 ${
          open ? 'v3-ai-ring' : 'bg-white/6 hover:bg-white/10'
        }`}
      >
        <IconSparkle className={`size-[20px] shrink-0 text-v3-ai ${thinking ? 'v3-thinking' : ''}`} />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onOpenChange(true)}
          placeholder="Descrie ce vrei să vezi..."
          aria-label="Căutare AI în catalog"
          className="min-w-0 flex-1 bg-transparent text-[16px]/[24px] text-v3-fg outline-none placeholder:text-v3-faint"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Șterge"
            className="shrink-0 text-v3-faint transition-colors hover:text-v3-fg"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-[6px] border border-v3-line px-[7px] py-[2px] font-meta text-[11px] text-v3-faint md:block">
            /
          </kbd>
        )}
      </div>

      {open && (
        <Panel
          query={query}
          hits={hits}
          thinking={thinking}
          total={total}
          onPick={pick}
          onClose={() => onOpenChange(false)}
        />
      )}
    </>
  )
}

function Panel({
  query,
  hits,
  thinking,
  total,
  onPick,
  onClose,
}: {
  query: string
  hits: Hit[]
  thinking: boolean
  total: number
  onPick: (phrase: string) => void
  onClose: () => void
}) {
  return (
    <>
      {/* Click-away scrim. Portalled to the body on purpose: rendered in place
          it would sit inside the header's stacking context and dim the header
          itself along with the page. */}
      {createPortal(
        <button
          type="button"
          aria-label="Închide căutarea"
          onClick={onClose}
          className="fixed inset-0 z-30 cursor-default bg-black/55 backdrop-blur-sm"
        />,
        document.body,
      )}

      <div className="v3-rise absolute inset-x-0 top-[calc(100%+12px)] z-40 overflow-hidden rounded-[24px] border border-v3-line bg-v3-panel/95 backdrop-blur-2xl">
        {/* the assistant's own colour, as a wash rather than as chrome */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(80% 120% at 8% 120%, rgba(78,202,255,0.16) 0%, transparent 62%), radial-gradient(70% 110% at 92% -20%, rgba(62,127,255,0.14) 0%, transparent 60%)',
          }}
          aria-hidden
        />

        <div className="relative grid gap-[clamp(20px,2.4vw,40px)] p-[clamp(20px,2.2vw,32px)] lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="text-balance text-[clamp(22px,1.9vw,30px)]/[1.2] font-bold tracking-[-0.02em]">
              Ce ai chef să vezi în seara asta?
            </h2>
            <p className="mt-[10px] text-[14px]/[21px] text-v3-dim">
              Descrie starea, nu titlul — „reality cu cupluri", „ceva scurt și amuzant",
              „sport în direct".
            </p>

            <ul className="mt-[20px] flex flex-wrap gap-[10px]">
              {SUGGESTIONS.map((phrase) => (
                <li key={phrase}>
                  <button
                    type="button"
                    onClick={() => onPick(phrase)}
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
                <IconSparkle className={`size-[14px] ${thinking ? 'v3-thinking' : ''}`} />
                Căutare AI
              </span>
              {total > hits.length && (
                <button
                  type="button"
                  className="rounded-[100px] border border-v3-line px-[14px] py-[6px] font-meta text-[11px] uppercase tracking-[0.12em] text-v3-dim transition-colors hover:text-v3-fg"
                >
                  Arată toate ({total})
                </button>
              )}
            </div>

            <div className="mt-[16px] min-h-[212px]">
              {!query.trim() ? (
                <p className="pt-[18px] text-[14px]/[21px] text-v3-faint">
                  Scrie o frază sau alege una dintre sugestii.
                </p>
              ) : thinking && !hits.length ? (
                <p className="v3-thinking pt-[18px] text-[14px]/[21px] text-v3-ai">Caut în catalog…</p>
              ) : hits.length ? (
                <ul className="grid gap-x-[24px] gap-y-[12px] sm:grid-cols-2">
                  {hits.map((hit) => (
                    <li key={hit.title}>
                      <Result hit={hit} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pt-[18px] text-[14px]/[21px] text-v3-faint">
                  Nimic pentru „{query}". Încearcă o descriere mai largă.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Închide"
          className="relative mx-auto mb-[14px] grid size-[32px] place-items-center rounded-full bg-white/8 text-v3-dim transition-colors hover:bg-white/16 hover:text-v3-fg"
        >
          <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  )
}

function Result({ hit }: { hit: Hit }) {
  const art = asset(hit.cover)
  const { a1, a2 } = accentFromTitle(hit.title)

  return (
    <a href="#" className="group/res flex items-center gap-[14px] rounded-[10px] p-[6px] transition-colors hover:bg-white/6">
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
