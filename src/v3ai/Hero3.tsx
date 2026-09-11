import { useCallback, useEffect, useRef, useState } from 'react'
import { heroSlides } from '../data/hero'
import { asset } from '../lib/assets'
import { accentFromTitle } from '../v2027/accent'
import { PlayGlyph } from '../v2027/PlayGlyph'
import { tidyTitle } from '../v2027/title'
import { HeroVideo } from './HeroVideo'

const ADVANCE_MS = 10000
/** A slide whose trailer is running earns more airtime than a still. */
const ADVANCE_MS_VIDEO = 20000

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

/** The hero type scale of the second skin. Romanian titles run to 46
 *  characters, so one fixed size either wastes the stage on a short title or
 *  lets a long one climb into the header; the size steps down by length and the
 *  line count is capped on top of that. */
function titleSize(title: string): string {
  if (title.length <= 22) return 'clamp(40px, 5.4vw, 88px)'
  if (title.length <= 34) return 'clamp(34px, 4.4vw, 68px)'
  return 'clamp(26px, 3.2vw, 52px)'
}

export function Hero3() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  /** Whether the trailer is running. Starts on its own shortly after the slide
   *  appears, so the hero is motion rather than a poster, and the Trailer
   *  button becomes a stop control. */
  const [playing, setPlaying] = useState(false)

  const slide = heroSlides[index]
  const art = asset(slide.still) ?? asset(slide.poster)
  const s = scores(slide.title)
  const { a1 } = accentFromTitle(slide.title)
  const stage = useRef<HTMLElement>(null)

  /** Changing slide always returns to key art — done here rather than in an
   *  effect on `index`, so the reset belongs to the action that caused it. */
  const goTo = useCallback((i: number) => {
    setIndex(((i % heroSlides.length) + heroSlides.length) % heroSlides.length)
    setPlaying(false)
  }, [])

  // start the trailer by itself once the key art has had a moment
  useEffect(() => {
    if (!slide.youtubeId) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setPlaying(true), 1200)
    return () => clearTimeout(t)
  }, [slide.youtubeId])

  /** Dwell time for this slide, fixed for as long as it is on screen.
   *
   *  It keys off whether the slide *has* a trailer, not off whether one is
   *  currently running. Keying it off `playing` meant the value changed 1.2s in,
   *  when the trailer autostarted — which restarted both the timer and the
   *  progress animation with a new duration, so the bar crawled, stalled,
   *  jumped, and then finished well before the slide actually changed. */
  const dwell = slide.youtubeId ? ADVANCE_MS_VIDEO : ADVANCE_MS

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

      {/* the still stays underneath, so the trailer fades in over it */}
      {playing && slide.youtubeId && (
        <HeroVideo key={slide.youtubeId} id={slide.youtubeId} muted={muted} />
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

          {/* Set as the second skin sets it: sentence case, one colour, size
              stepped by length, and leading never under 1.06 — Romanian marks
              sit above ă â î and below ș ț, and a tighter line box shaves
              them, which the uppercase condensed version did. */}
          <h1
            className="mt-[16px] line-clamp-3 text-balance pb-[0.08em] font-black leading-[1.06] tracking-[-0.032em]"
            style={{ fontSize: titleSize(slide.title) }}
          >
            {tidyTitle(slide.title)}
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
            {slide.youtubeId ? (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex items-center gap-[9px] rounded-[100px] border border-v3-line bg-white/6 px-[22px] py-[12px] text-[14px]/[18px] font-semibold backdrop-blur-md transition-colors hover:bg-white/14"
              >
                {playing ? 'Oprește trailerul' : 'Trailer'}
              </button>
            ) : (
              <a
                href={slide.slug ? `https://antenaplay.ro/${slide.slug}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-[9px] rounded-[100px] border border-v3-line bg-white/6 px-[22px] py-[12px] text-[14px]/[18px] font-semibold backdrop-blur-md transition-colors hover:bg-white/14"
              >
                Trailer
              </a>
            )}
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

      {/* Each segment doubles as the countdown to the next slide: the current
          one fills over the dwell time, the ones behind it stay full, and it
          pauses exactly when the carousel does — on hover — so the bar never
          claims progress that is not happening. */}
      <div className="v3-inset absolute inset-x-0 bottom-[clamp(22px,3vh,38px)] flex gap-[7px]">
        {heroSlides.map((sl, i) => (
          <button
            key={sl.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1}. ${sl.title}`}
            aria-current={i === index}
            className="group/seg h-[3px] flex-1 overflow-hidden rounded-full bg-white/22 transition-colors hover:bg-white/40"
          >
            <span
              key={i === index ? `${index}-live` : 'idle'}
              className="v3-seg-fill block h-full origin-left rounded-full bg-v3-action"
              /* The bar is the clock. Advancing on its own animationend rather
                 than on a parallel setTimeout means the two can never drift:
                 hovering pauses the animation and therefore the carousel, and
                 the slide changes exactly when the segment fills. */
              onAnimationEnd={i === index ? () => goTo(index + 1) : undefined}
              style={
                i === index
                  ? {
                      animation: `v3-seg ${dwell}ms linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }
                  : { transform: i < index ? 'scaleX(1)' : 'scaleX(0)' }
              }
            />
          </button>
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
