import { asset } from '../lib/assets'
import { accentFromTitle } from './accent'

/** AntenaPLAY's own lazy-load placeholder, as exported by Figma. Treated as
 *  "no artwork" rather than shown, so a row never has a grey hole in it. */
const FIGMA_PLACEHOLDER = '1428dec7d5b66b0e09260d862db7ea5e0519cf4f'

/** A 40-hex key is a Figma export; anything else is an AntenaPLAY show slug.
 *  The two have different shapes, and therefore need different crops. */
const isFigmaExport = (key: string) => /^[0-9a-f]{40}$/.test(key)

/** Artwork slot with a designed fallback.
 *
 *  The old page dropped a grey rectangle with a logo whenever art was missing —
 *  and on some rails that was half the row. Here a missing export still gets a
 *  composed tile: the title's own fed colour as a two-lobe wash. The title is
 *  never drawn inside the art; it always belongs to the UI layer, so the row
 *  keeps its rhythm and its typography either way. */
export function CardArt({
  cover,
  title,
  className = '',
  eager = false,
}: {
  cover: string | null
  title: string
  className?: string
  /** Set for artwork above the fold. Everything else defers: the page carries
   *  a few hundred stills, and fetching them all up front makes a shared link
   *  crawl before the first row is even reachable. */
  eager?: boolean
}) {
  const src = cover === FIGMA_PLACEHOLDER ? null : asset(cover)

  if (src && cover) {
    /* Crop position depends on where the artwork keeps its content.
     *
     * Figma's poster exports are 537×906 (0.593) — taller than any card box —
     * and several carry a promo sticker burnt into the top edge ("DIN
     * OCTOMBRIE", "EPISOD NOU"). Cropping around the centre cut those in half,
     * so these anchor to the top and lose the bottom of the photo instead.
     *
     * The AntenaPLAY stills are 16:9, where the subject sits above the middle,
     * so those bias slightly upward from centre. */
    const position = isFigmaExport(cover) ? 'object-top' : 'object-[center_32%]'
    return (
      <img
        src={src}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        fetchPriority={eager ? 'high' : 'auto'}
        className={`size-full object-cover ${position} ${className}`}
      />
    )
  }

  const { a1, a2 } = accentFromTitle(title)
  return (
    <div
      className={`size-full bg-[#16161c] ${className}`}
      style={{
        backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${a1} / 0.55) 0%, transparent 62%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.45) 0%, transparent 66%)`,
      }}
    />
  )
}
