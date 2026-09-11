import { useCallback, useEffect, useRef, useState } from 'react'

/** Trailer playback behind the hero.
 *
 *  AntenaPLAY's own stream sits behind their token gate, so this plays the
 *  official upload from the show's own YouTube channel — their publishing,
 *  their player, nothing worked around.
 *
 *  Three things this got wrong first time round, all worth keeping:
 *
 *  - `loop=1` needs `playlist=<id>`, and that turns the embed into a *playlist*
 *    player, which draws previous / pause / next buttons over the video. So the
 *    loop is driven from the API instead: on ENDED, seek to 0 and play again.
 *  - The frame stays hidden until the player reports that it is playing, so the
 *    hero shows key art rather than a black rectangle while the player boots —
 *    and if a browser refuses muted autoplay, the still simply stays, instead of
 *    a paused player sitting there with an overlay on it.
 *  - It is scaled past the frame, because the player letterboxes a 16:9 video
 *    inside a much wider box, and takes no pointer events, so neither YouTube's
 *    hover UI nor its click targets are ever reachable.
 *
 *  One thing no parameter fixes: these are monetised uploads, so the embed can
 *  serve a pre-roll. Ambient autoplay without that risk needs a file Antena
 *  hands over. */
export function HeroVideo({ id, muted }: { id: string; muted: boolean }) {
  const [playing, setPlaying] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  const command = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube-nocookie.com',
    )
  }, [])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.origin.includes('youtube')) return
      let data: { event?: string; info?: unknown }
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }
      if (data.event === 'onReady') {
        command('playVideo')
        return
      }

      // The widget API does not reliably send `onStateChange`; in practice the
      // state arrives inside `infoDelivery.info.playerState`. Read both, or the
      // frame never learns that it is playing and stays hidden for good.
      const state =
        data.event === 'onStateChange'
          ? (data.info as number | undefined)
          : data.event === 'infoDelivery'
            ? (data.info as { playerState?: number } | undefined)?.playerState
            : undefined
      if (state === undefined) return

      // 1 = playing, 3 = buffering (already committed to starting), 0 = ended
      if (state === 1 || state === 3) setPlaying(true)
      if (state === 0) {
        command('seekTo', [0, true])
        command('playVideo')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [command])

  // the player only emits events once a listener has announced itself
  const announce = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'antena-hero' }),
      'https://www.youtube-nocookie.com',
    )
  }, [])

  useEffect(() => {
    if (!playing) return
    command(muted ? 'mute' : 'unMute')
  }, [muted, playing, command])

  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1` +
    `&rel=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1`

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <iframe
        ref={frame}
        src={src}
        title=""
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        onLoad={announce}
        className={`size-full scale-[1.32] border-0 transition-opacity duration-[1200ms] ${
          playing ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
