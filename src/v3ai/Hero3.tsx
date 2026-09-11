import { useEffect, useRef, useState } from 'react'
import { heroSlides } from '../data/hero'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { PlayGlyph } from '../v2027/PlayGlyph'

const ADVANCE_MS = 10000

/** Scores are mockup values. Derived from the title so a given show always
 *  shows the same numbers rather than flickering between renders. */
function scores(title: string): { public: number; critics: number } {
  let h = 2166136261
  for (let i = 0; i < title.length; i++) {
    h ^= title.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const n = Math.abs(h)
  return { public: 68 + (n % 30), critics: 55 + ((n >> 7) % 40) }
}

/** Splits an AntenaPLAY title on its own separator so the qualifier can take
 *  the accent colour — the two-tone display treatment from Figma 10:246, but
 *  driven by the naming convention instead of an arbitrary word. */
function split(title: string): [string, string | null] {
  const i = title.indexOf('|')
  if (i < 0) return [title, null]
  return [title.slice(0, i).trim(), title.slice(i + 1).trim()]
}

export function Hero3() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)

  const slide = heroSlides[index]
  const art = asset(slide.still) ?? asset(slide.poster)
  const [lead, tail] = split(slide.title)
  const s = scores(slide.title)
  const { a1 } = accentFromTitle(slide.title)
  const stage = useRef<HTMLElement>(null)

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % heroSlides.length), ADVANCE_MS)
    return () => clearTimeout(t)
  }, [index, paused])

  return (
    <section
      ref={stage}
      className="relative h-[clamp(600px,82vh,860px)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {art ? (
        <img key={index} src={art} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(80% 100% at 70% 10%, hsl(${a1} / 0.6), transparent 70%)` }}
        />
      )}

      {/* Figma 10:2 keeps the copy on a near-solid left column with the art
          bleeding out to the right, which is what makes long Romanian titles
          survive at display size. */}
      <div className="absolute inset-0 bg-[linear-gradient(94deg,var(--color-v3-ground)_0%,rgba(8,8,11,0.94)_26%,rgba(8,8,11,0.55)_52%,transparent_84%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent to-v3-ground" />

      <div className="v3-inset absolute inset-x-0 bottom-[clamp(52px,7vh,92px)] top-[140px] flex flex-col justify-end">
        <div className="max-w-[min(620px,52vw)]">
          <p className="flex items-center gap-[10px] font-meta text-[11px] uppercase tracking-[0.16em] text-v3-dim">
            <span className="rounded-[4px] bg-v3-action px-[7px] py-[2px] font-bold text-white">Nou</span>
            Sezon nou · exclusiv AntenaPLAY
          </p>

          <h1 className="v3-display mt-[16px] text-[clamp(38px,4.6vw,76px)] uppercase">
            {lead}
            {tail && (
              <>
                {' '}
                <span className="text-v3-action">{tail}</span>
              </>
            )}
          </h1>

          <div className="mt-[16px] flex flex-wrap items-center gap-[10px] font-meta text-[12px] uppercase tracking-[0.1em] text-v3-dim">
            <span className="rounded-[4px] border border-v3-line px-[7px] py-[2px]">AP 12</span>
            <span>2026</span>
            <span aria-hidden>·</span>
            <span>Sezon complet</span>
          </div>

          {/* the score pills of Figma 12:1530, relabelled for this audience */}
          <div className="mt-[16px] flex flex-wrap items-center gap-[18px]">
            <Score label="Public" value={s.public} tone="var(--color-v3-action)" />
            <Score label="Critici" value={s.critics} tone="var(--color-v3-ai)" />
          </div>

          <p className="mt-[16px] max-w-[520px] text-[clamp(14px,1.1vw,17px)]/[1.6] text-v3-dim">
            {slide.description}
          </p>

          <div className="mt-[24px] flex flex-wrap items-center gap-[10px]">
            <a
              href={
                slide.trailerId
                  ? `https://antenaplay.ro/v/${slide.trailerId}`
                  : slide.slug
                    ? `https://antenaplay.ro/${slide.slug}`
                    : '#'
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-[9px] rounded-[100px] bg-v3-action px-[24px] py-[13px] text-[14px]/[18px] font-bold text-white transition-all hover:brightness-110"
            >
              <PlayGlyph className="size-[16px]" />
              Redă
            </a>
            <button
              type="button"
              className="flex items-center gap-[9px] rounded-[100px] border border-v3-line bg-white/6 px-[22px] py-[12px] text-[14px]/[18px] font-semibold backdrop-blur-md transition-colors hover:bg-white/14"
            >
              Trailer
            </button>
            <button
              type="button"
              aria-label="Adaugă în listă"
              className="grid size-[44px] place-items-center rounded-full border border-v3-line bg-white/6 backdrop-blur-md transition-colors hover:bg-white/14"
            >
              <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Activează sonorul' : 'Oprește sonorul'}
        className="absolute bottom-[clamp(52px,7vh,92px)] right-[clamp(20px,2.4vw,44px)] grid size-[44px] place-items-center rounded-full border border-v3-line bg-black/45 text-v3-fg backdrop-blur-md transition-colors hover:bg-black/70"
      >
        <svg viewBox="0 0 24 24" className="size-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 9h3l4-3v12l-4-3H4z" strokeLinejoin="round" />
          {muted ? (
            <path d="M16 9l5 6m0-6l-5 6" strokeLinecap="round" />
          ) : (
            <path d="M16 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <div className="v3-inset absolute inset-x-0 bottom-[clamp(22px,3vh,38px)] flex gap-[7px]">
        {heroSlides.map((sl, i) => (
          <button
            key={sl.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}. ${sl.title}`}
            aria-current={i === index}
            className={`h-[3px] flex-1 rounded-full transition-colors ${
              i === index ? 'bg-v3-action' : 'bg-white/22 hover:bg-white/45'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

function Score({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span className="flex items-center gap-[9px]">
      <span className="font-meta text-[12px] uppercase tracking-[0.1em] text-v3-dim">{label}</span>
      <span className="relative h-[20px] w-[58px] overflow-hidden rounded-[100px] bg-white/10">
        <span
          className="absolute inset-y-0 left-0 rounded-[100px] opacity-45"
          style={{ width: `${value}%`, backgroundColor: tone }}
        />
        <span className="absolute inset-0 grid place-items-center text-[12px] font-bold text-v3-fg">
          {value}%
        </span>
      </span>
    </span>
  )
}
