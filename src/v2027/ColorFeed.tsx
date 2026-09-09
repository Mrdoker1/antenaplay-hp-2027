import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { accentFromImage, accentFromTitle, sampledAccent, type Accent } from './accent'
import { ColorFeedContext } from './colorFeedContext'

/** How long the pointer must settle on a card before the page reacts. Long
 *  enough that crossing a row does not queue up ten colour changes. */
const SETTLE_MS = 140
const FADE_MS = 900

/** Colour feeding.
 *
 *  Three things make this calm rather than twitchy:
 *
 *  1. It crossfades. `background-image` is not an animatable property — a
 *     transition on it snaps — so the mesh lives on two stacked layers and the
 *     incoming one fades in over opacity, which the compositor can actually
 *     interpolate.
 *  2. It commits once. Sampling the artwork is async, so an earlier version
 *     showed the title-derived fallback first and the real colour a moment
 *     later: two jumps per hover. Now the accent is resolved before anything
 *     changes, and a cached sample resolves synchronously.
 *  3. It settles instead of resetting. Leaving a card no longer reverts the
 *     background, so moving between cards is one transition, not two.
 *
 *  Under `prefers-reduced-motion` the feed is disabled outright and the page
 *  keeps its resting accent. */
export function ColorFeedProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial: Accent
}) {
  const [layers, setLayers] = useState<[Accent, Accent]>([initial, initial])
  const [front, setFront] = useState(0)
  const frontRef = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const token = useRef(0)
  const current = useRef(initial)

  /** Off when the viewer asked for less motion, or via ?feed=off — the effect
   *  is the kind of thing a room full of people will have an opinion about. */
  const disabled = useMemo(() => {
    if (typeof window === 'undefined') return true
    if (new URLSearchParams(window.location.search).get('feed') === 'off') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const commit = useCallback((next: Accent) => {
    if (next.a1 === current.current.a1 && next.a2 === current.current.a2) return
    current.current = next
    // the back layer takes the new colour, then becomes the front one and
    // fades in over it. Kept out of a setState updater: those must stay pure.
    const back = frontRef.current === 0 ? 1 : 0
    frontRef.current = back
    setLayers((prev) => {
      const copy: [Accent, Accent] = [...prev]
      copy[back] = next
      return copy
    })
    setFront(back)
  }, [])

  const feed = useCallback(
    (title: string, art: string | null) => {
      if (disabled) return
      window.clearTimeout(timer.current)
      const mine = ++token.current

      // a colour we have already sampled is available now, so no wait
      const cached = art ? sampledAccent(art) : accentFromTitle(title)

      timer.current = window.setTimeout(() => {
        if (token.current !== mine) return
        if (cached) {
          commit(cached)
          return
        }
        void accentFromImage(art!, title).then((next) => {
          if (token.current === mine) commit(next)
        })
      }, SETTLE_MS)
    },
    [commit, disabled],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /* The provider owns the skin's shell so the paint order is unambiguous:
     .v2027 background, then the wash at z-0, then all content at z-10. A
     negative z-index would be hoisted to the root stacking context and end up
     behind the opaque page background. */
  return (
    <ColorFeedContext.Provider value={{ feed }}>
      <div className="v2027 grain relative min-h-screen">
        {/* Fixed, so the wash is ambient light on the page rather than a band
            that scrolls with the content. */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
          {layers.map((accent, i) => (
            <div
              key={i}
              className="mesh-layer absolute inset-0"
              style={
                {
                  opacity: front === i ? 1 : 0,
                  transitionDuration: `${FADE_MS}ms`,
                  '--a1': accent.a1,
                  '--a2': accent.a2,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </ColorFeedContext.Provider>
  )
}
