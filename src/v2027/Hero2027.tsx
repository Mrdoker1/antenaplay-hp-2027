import { useEffect, useRef, useState } from 'react'
import { heroSlides } from '../data/hero'
import { asset } from '../lib/assets'
import { CardArt } from './CardArt'
import { PlayGlyph } from './PlayGlyph'
import { Badge } from './Badge'
import { Meta } from './Meta'
import { useColorFeed } from './colorFeedContext'
import { tidyTitle } from './title'

const ADVANCE_MS = 9000

/** Romanian show titles run long — "Insula Iubirii PLUS | Imagini nedifuzate la
 *  TV" is 46 characters. One fixed display size either wastes the stage on short
 *  titles or lets long ones climb into the header, so the size steps down by
 *  length and the line count is capped on top of that. */
function titleSize(title: string): string {
  if (title.length <= 22) return 'clamp(40px, 5.4vw, 88px)'
  if (title.length <= 34) return 'clamp(34px, 4.4vw, 68px)'
  return 'clamp(26px, 3.2vw, 52px)'
}

/** Cinematic hero.
 *
 *  The title is typeset, not a logo lockup — the single biggest change from the
 *  baseline, and what lets one type system hold the page together. The art
 *  parallaxes behind it, the slide indicator is a segmented progress track
 *  rather than ten anonymous dots, and the slide in view feeds the page colour. */
export function Hero2027() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [offset, setOffset] = useState(0)
  const { feed } = useColorFeed()
  const stage = useRef<HTMLElement>(null)

  const slide = heroSlides[index]
  const art = asset(slide.still) ?? asset(slide.poster)

  // only feed while the hero is on screen; an off-screen carousel advancing
  // every 9s must not reach up and repaint the page you are actually looking at
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (inView) feed(slide.title, art)
  }, [art, feed, inView, slide.title])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % heroSlides.length), ADVANCE_MS)
    return () => clearTimeout(t)
  }, [index, paused])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => setOffset(Math.min(window.scrollY, 900) * 0.16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={stage}
      className="art-surface relative h-[clamp(560px,74vh,780px)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0" style={{ transform: `translate3d(0, ${offset}px, 0)` }}>
        {/* keyed on the slide so the push-in restarts with each one */}
        <div key={index} className="ken-burns size-full">
          <CardArt cover={slide.still ?? slide.poster ?? null} title={slide.title} eager />
        </div>
      </div>

      {/* Readability, in two passes: a side wash for the copy column and a
          bottom fade that hands off to the page surface. */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--color-s0)_4%,rgba(10,10,12,0.72)_38%,transparent_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-s0" />

      {/* Bounded top and bottom, contents pushed to the bottom: the copy block
          can grow, but it can never reach up into the header. */}
      <div className="page-pad pointer-events-none absolute inset-x-0 bottom-[clamp(56px,6vh,96px)] top-[86px] flex flex-col justify-end">
        <div className="pointer-events-auto max-w-[min(680px,56vw)]">
          <div className="flex items-center gap-[10px]">
            <Badge kind="new" />
            <Meta>Sezon nou · exclusiv AntenaPLAY</Meta>
          </div>

          <h1
            className="mt-[16px] line-clamp-3 text-balance pb-[0.08em] font-black leading-[1.06] tracking-[-0.032em]"
            style={{ fontSize: titleSize(slide.title) }}
          >
            {tidyTitle(slide.title)}
          </h1>

          <p className="mt-[16px] line-clamp-2 max-w-[520px] text-pretty text-[clamp(15px,1.2vw,18px)]/[1.55] text-fg-muted">
            {slide.description}
          </p>

          <div className="mt-[26px] flex flex-wrap items-center gap-[10px]">
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
              className="flex items-center gap-[9px] rounded-full bg-fg px-[24px] py-[13px] text-[14px]/[18px] font-bold text-s0 transition hover:bg-white"
            >
<PlayGlyph className="size-[17px]" />
              Redă
            </a>
            <a
              href="#"
              className="flex items-center gap-[9px] rounded-full bg-white/12 px-[24px] py-[13px] text-[14px]/[18px] font-semibold backdrop-blur-md transition hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Listă
            </a>
          </div>
        </div>
      </div>

      {/* Segmented progress: says how many slides there are and where you are,
          which ten identical dots never did. */}
      <div className="page-pad absolute inset-x-0 bottom-[clamp(28px,3vh,44px)] flex gap-[6px]">
        {heroSlides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}. ${s.title}`}
            aria-current={i === index}
            className="group/seg h-[3px] flex-1 overflow-hidden rounded-full bg-white/22"
          >
            <span
              className={`block h-full rounded-full bg-fg transition-[width] duration-500 ${
                i === index ? 'w-full' : 'w-0 group-hover/seg:w-1/3'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
