import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../lib/assets'
import { IconSparkle } from '../v3ai/icons'
import { countMatches, search, stats, SUGGESTIONS, type Hit } from '../v3ai/search'
import { useTvNav } from './useTvNav'

type Recognition = {
  lang: string
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

/** Speech recognition where the browser has it. Chrome exposes it prefixed;
 *  everywhere else this returns null and the caller falls back. */
function createRecognition(): Recognition | null {
  const w = window as unknown as Record<string, new () => Recognition>
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  const r = new Ctor()
  r.lang = 'ro-RO'
  r.interimResults = false
  return r
}

/** Search on a TV.
 *
 *  This is the screen the whole concept rests on, because it is the one place
 *  where a remote is worse than a phone and an assistant is better than either.
 *  Nobody types a sentence with a D-pad, so there is no keyboard here: you
 *  either press the microphone and say it, or pick one of the phrases.
 *
 *  The microphone uses the browser's own speech recognition when it exists.
 *  When it does not — or permission is refused — it falls back to one of the
 *  example phrases so the path is still demonstrable, and says so on screen
 *  rather than pretending it heard something. */
export function TvSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [simulated, setSimulated] = useState(false)
  const recognition = useRef<Recognition | null>(null)

  const hits = useMemo<Hit[]>(() => (query ? search(query, 8) : []), [query])
  const total = useMemo(() => (query ? countMatches(query) : 0), [query])

  const rows = useMemo(
    () => [1 + SUGGESTIONS.length, Math.max(hits.length, 1)],
    [hits.length],
  )

  const ask = useCallback((phrase: string) => {
    setQuery(phrase)
    setSimulated(false)
  }, [])

  const listen = useCallback(() => {
    const r = createRecognition()
    if (!r) {
      // no speech API here: show the path rather than a dead button
      setListening(true)
      setSimulated(true)
      setTimeout(() => {
        setListening(false)
        setQuery(SUGGESTIONS[0])
      }, 1500)
      return
    }
    recognition.current = r
    setSimulated(false)
    setListening(true)
    r.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript
      if (said) setQuery(said)
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
  }, [])

  useEffect(() => () => recognition.current?.stop(), [])

  const onEnter = useCallback(
    ({ row, col }: { row: number; col: number }) => {
      if (row === 0) {
        if (col === 0) listen()
        else ask(SUGGESTIONS[col - 1])
      }
    },
    [ask, listen],
  )

  const { focus } = useTvNav(rows, onEnter)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-50 bg-tv-ground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(70% 90% at 12% 100%, rgba(160,107,255,0.22) 0%, transparent 60%), radial-gradient(60% 80% at 92% 0%, rgba(234,29,37,0.16) 0%, transparent 58%)',
        }}
      />

      <div
        className="relative flex h-full flex-col"
        style={{
          padding: 'var(--tv-safe)',
          paddingLeft: 'calc(var(--tv-rail) + var(--tv-safe))',
        }}
      >
        <div className="flex items-center gap-[14px]">
          <IconSparkle className={`size-[30px] text-tv-fg ${listening ? 'v3-thinking' : ''}`} />
          <p className="text-[26px]/[32px] font-meta uppercase tracking-[0.16em] text-tv-dim">
            Căutare AI
          </p>
        </div>

        {/* one line, always: a phrase that wraps pushes the results off the
            screen, and there is no scrolling past it with a remote */}
        <h1 className="mt-[18px] truncate text-[46px]/[56px] font-bold tracking-[-0.02em]">
          {listening ? 'Te ascult…' : query ? `„${query}"` : 'Ce ai chef să vezi?'}
        </h1>
        <p className="mt-[10px] text-[22px]/[30px] text-tv-dim">
          {simulated
            ? 'Microfonul nu e disponibil aici — am folosit un exemplu.'
            : 'Apasă microfonul și spune ce cauți, sau alege o sugestie.'}
        </p>

        <div className="mt-[26px] flex items-center gap-[14px]">
          <Pill focused={focus.row === 0 && focus.col === 0} tone="ai">
            <span className="flex items-center gap-[12px]">
              <Microphone className="size-[26px]" />
              {listening ? 'Ascult…' : 'Vorbește'}
            </span>
          </Pill>
          {SUGGESTIONS.map((phrase, i) => (
            <Pill key={phrase} focused={focus.row === 0 && focus.col === i + 1}>
              <span className="first-letter:uppercase">{phrase}</span>
            </Pill>
          ))}
        </div>

        <div className="mt-[34px] min-h-0 flex-1">
          {hits.length ? (
            <div className="tv-no-scrollbar flex gap-[18px] overflow-x-auto pt-[10px]">
              {hits.map((hit, i) => (
                <Result key={hit.title} hit={hit} focused={focus.row === 1 && focus.col === i} />
              ))}
            </div>
          ) : (
            <p className="pt-[16px] text-[22px]/[30px] text-tv-faint">
              Rezultatele apar aici.
            </p>
          )}
        </div>

        {/* the arrows are self-evident; what is not is how much was found */}
        <p className="font-meta text-[20px]/[26px] uppercase tracking-[0.14em] text-tv-faint">
          {query
            ? `${total} rezultate pentru „${query}"`
            : `${stats.films} de filme · ${stats.shows} de titluri AntenaPLAY`}
        </p>
      </div>
    </div>
  )
}

function Pill({
  children,
  focused,
  tone,
}: {
  children: React.ReactNode
  focused: boolean
  tone?: 'ai'
}) {
  return (
    <span
      className={`rounded-full px-[24px] py-[12px] text-[22px]/[28px] font-semibold transition-transform duration-200 ${
        tone === 'ai' ? 'bg-tv-ai/20 text-tv-fg' : 'bg-white/10 text-tv-fg'
      } ${focused ? (tone === 'ai' ? 'tv-focus-ai scale-[1.05]' : 'tv-focus scale-[1.05]') : ''}`}
    >
      {children}
    </span>
  )
}

function Result({ hit, focused }: { hit: Hit; focused: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const art = asset(hit.art)

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focused])

  return (
    <div ref={ref} className="w-[268px] shrink-0">
      <div
        className={`relative aspect-video overflow-hidden rounded-[10px] bg-tv-raised transition-transform duration-200 ${
          focused ? 'tv-focus scale-[1.05]' : ''
        }`}
      >
        {art && (
          <img
            src={art}
            alt=""
            loading="lazy"
            className={`size-full object-cover object-top ${focused ? '' : 'brightness-[0.72]'}`}
          />
        )}
      </div>
      <p className="mt-[12px] truncate text-[22px]/[28px] font-semibold">{hit.title}</p>
      <p className="truncate text-[19px]/[26px] text-tv-dim">{hit.vibe}</p>
    </div>
  )
}

function Microphone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" strokeLinecap="round" />
    </svg>
  )
}
