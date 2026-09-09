import { useEffect, useState } from 'react'
import { heroSlides } from '../data/hero'
import { asset } from '../lib/assets'
import { Placeholder } from './Placeholder'

const ADVANCE_MS = 8000

/** Figma node 1:6 — 696px stage. Key art sits under a 67° left-side scrim and
 *  a bottom fade into #161616; the copy block is 438px wide at the page gutter,
 *  154px down. Ten 12px dots sit centred at y=667. */
export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % heroSlides.length), ADVANCE_MS)
    return () => clearTimeout(t)
  }, [index, paused])

  const slide = heroSlides[index]
  const art = asset(slide.still) ?? asset(slide.poster)

  return (
    <section
      className="relative h-[696px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {art ? (
        <img key={index} src={art} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Placeholder className="absolute inset-0 size-full" />
      )}

      {/* Figma 1:25 — angled scrim across the left 1277px */}
      <div
        className="absolute inset-y-0 left-0 w-[1277px] max-w-[74%]"
        style={{
          backgroundImage:
            'linear-gradient(67.04deg, rgba(0,0,0,0.6) 7.21%, rgba(0,0,0,0) 79.95%)',
        }}
      />
      {/* Figma 1:26 — bottom fade that hands off to the page background */}
      <div className="absolute inset-x-0 bottom-0 h-[259px] bg-gradient-to-b from-[rgba(22,22,22,0)] to-ink" />

      <div className="page-gutter absolute left-0 top-[154.26px] w-full">
        <div className="max-w-[438px]">
          <h1 className="text-[53.952px]/[53.952px] font-bold tracking-[0.2px]">{slide.title}</h1>
          <p className="mt-[20px] text-[21.6px]/[25.92px] tracking-[0.2px]">{slide.description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Activează sonorul' : 'Oprește sonorul'}
        className="absolute right-[69.117px] top-[195.5px] grid size-[60px] place-items-center rounded-full bg-[rgba(34,34,34,0.6)] opacity-80 transition hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 9h3l4-3v12l-4-3H4z" strokeLinejoin="round" />
          {muted ? (
            <path d="M16 9l5 6m0-6l-5 6" strokeLinecap="round" />
          ) : (
            <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <div className="absolute bottom-[17px] left-1/2 flex -translate-x-1/2 gap-[8px]">
        {heroSlides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}: ${s.title}`}
            aria-current={i === index}
            className={`size-[12px] rounded-full transition ${
              i === index ? 'bg-brand' : 'bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
