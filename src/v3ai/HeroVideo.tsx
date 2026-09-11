import { useEffect, useRef, useState } from 'react'

/** Trailer playback behind the hero.
 *
 *  AntenaPLAY's own trailer stream sits behind their token gate, so this plays
 *  the official upload from the show's own YouTube channel instead — their
 *  publishing, their player, no gate to work around.
 *
 *  Three details make it read as a hero backdrop rather than an embed: it waits
 *  a beat so the still is what you see first and there is no flash of black; it
 *  is scaled past the frame, because the player letterboxes a 16:9 video inside
 *  a much wider box and the scale crops those bars away; and it never takes
 *  pointer events, so the hero's own buttons stay clickable. */
export function HeroVideo({ id, muted, startDelay = 900 }: { id: string; muted: boolean; startDelay?: number }) {
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  // Hero3 keys this component by video id, so a slide change remounts it and
  // there is no stale state to reset here.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setArmed(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // the player takes mute/unmute over postMessage, so the hero's own control
  // drives it rather than the viewer having to find YouTube's
  useEffect(() => {
    if (!ready) return
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: muted ? 'mute' : 'unMute', args: [] }),
      '*',
    )
  }, [muted, ready])

  if (!armed) return null

  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}` +
    `&modestbranding=1&playsinline=1&rel=0&disablekb=1&iv_load_policy=3&enablejsapi=1`

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <iframe
        ref={frame}
        src={src}
        title=""
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        onLoad={() => setReady(true)}
        className={`size-full scale-[1.32] border-0 transition-opacity duration-[1200ms] ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
