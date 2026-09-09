/** The play triangle, once, so every surface uses the same shape.
 *
 *  Two things the default `M8 5v14l11-7z` gets wrong: its bounding box sits at
 *  x 8–19, so the centre lands at 13.5 in a box centred on 12 — already pushed
 *  right before any margin is added — and its corners are hard.
 *
 *  Here the triangle is drawn symmetric about y=12 and centred on x=12.4: dead
 *  centre plus the small rightward optical bias a right-pointing triangle needs,
 *  because its visual mass sits behind the apex. The corners are rounded by
 *  stroking the same path with a round linejoin, which is both simpler and
 *  truer than hand-writing arcs. */
export function PlayGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M7.55 6.75 17.25 12 7.55 17.25Z"
        fill="currentColor"
        stroke="currentColor"
        // the stroke is what rounds the corners, so its width sets how soft
        // they are: 1.8 keeps them legible as corners rather than as blobs
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
