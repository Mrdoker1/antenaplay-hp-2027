/** Motes drifting off whatever the assistant is working on.
 *
 *  The skin already says "this is the AI surface" with a colour and a spinning
 *  edge; this is the part that says it is *awake*. A handful of small violet
 *  motes rising and fading is enough — the point is ambient life, and anything
 *  denser turns a search field into a screensaver.
 *
 *  The positions are a fixed table rather than random: the component rerenders
 *  on every keystroke in the field it decorates, and randomised motes would
 *  jump to new places each time and restart their animations. Fixed offsets,
 *  each with its own duration and delay, keep them out of step with each other
 *  without ever moving.
 *
 *  Motion stops under `prefers-reduced-motion` — the skin's stylesheet kills
 *  every animation inside `.v3ai`, and at the first keyframe a mote is fully
 *  transparent, so what reduced motion gets is nothing at all rather than a
 *  frozen constellation. */

type Mote = {
  /** start, as a percentage of the box */
  x: number
  y: number
  /** where it drifts to, in px */
  dx: number
  dy: number
  size: number
  dur: number
  delay: number
}

const MOTES: Mote[] = [
  { x: 4, y: 62, dx: 14, dy: -30, size: 11, dur: 5.4, delay: 0 },
  { x: 17, y: 84, dx: -9, dy: -38, size: 7, dur: 6.8, delay: 1.6 },
  { x: 29, y: 46, dx: 11, dy: -26, size: 8, dur: 4.9, delay: 3.1 },
  { x: 41, y: 88, dx: -6, dy: -44, size: 13, dur: 7.4, delay: 0.7 },
  { x: 54, y: 58, dx: 16, dy: -32, size: 7, dur: 5.9, delay: 2.4 },
  { x: 66, y: 90, dx: -12, dy: -40, size: 12, dur: 6.3, delay: 4.2 },
  { x: 77, y: 52, dx: 8, dy: -28, size: 8, dur: 5.1, delay: 1.1 },
  { x: 88, y: 82, dx: -14, dy: -36, size: 10, dur: 7.1, delay: 3.6 },
  { x: 95, y: 60, dx: 7, dy: -24, size: 7, dur: 6.1, delay: 5.0 },
]

export function Sparks({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {MOTES.map((m, i) => (
        <span
          key={i}
          /* Heavily blurred, so they are light rather than objects: a sharp
             dot on a poster reads as dust on the screen, and the same mote
             diffused reads as glow coming off the thing it is orbiting. And
             screened rather than laid on top, so it adds light instead of
             painting violet over whatever it crosses — over a bright poster a
             blurred violet disc is a smudge, the same disc screened is a
             gleam. */
          className="v3-spark absolute rounded-full bg-v3-ai/80 mix-blend-screen blur-[4px]"
          style={
            {
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              '--v3-dx': `${m.dx}px`,
              '--v3-dy': `${m.dy}px`,
              '--v3-dur': `${m.dur}s`,
              '--v3-delay': `${m.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}
