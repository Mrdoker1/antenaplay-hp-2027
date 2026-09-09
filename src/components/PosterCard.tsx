import { asset } from '../lib/assets'
import type { Poster } from '../data/types'
import { Placeholder } from './Placeholder'

/** Figma: 258×437 card on a 266px pitch, 4px radius, artwork under a
 *  transparent→black/40% wash starting at 177.68px, title lockup on top. */
export function PosterCard({ poster, width = 258, height = 437 }: {
  poster: Poster
  width?: number
  height?: number
}) {
  const cover = asset(poster.cover)
  const logo = asset(poster.logo)

  return (
    <a
      href="#"
      title={poster.name}
      className="group relative block shrink-0 overflow-hidden rounded-[4px] transition duration-300 hover:z-10 hover:scale-[1.04] hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
      style={{ width, height }}
    >
      {cover ? (
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Placeholder className="absolute inset-0 size-full" />
      )}

      {/* Figma "Text": bottom wash that lifts the title lockup off the artwork */}
      <div className="absolute inset-x-0 bottom-0 h-[59%] bg-gradient-to-b from-transparent to-black/40" />

      {logo ? (
        <img
          src={logo}
          alt={poster.name}
          className="absolute inset-x-[15%] bottom-[7.5%] max-h-[35%] w-[70%] object-contain object-bottom"
        />
      ) : (
        poster.name && (
          <span className="absolute inset-x-[10%] bottom-[7%] text-center text-[15px]/[19px] font-bold tracking-[0.4px] text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {poster.name}
          </span>
        )
      )}
    </a>
  )
}
