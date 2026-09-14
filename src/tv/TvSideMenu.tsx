import mark from '../assets/antena-mark.svg'
import { MENU } from './menu'

/** The side menu.
 *
 *  Collapsed to a strip of icons until it has the remote, then it slides out
 *  with labels — which is the only way a menu can work here, since there is no
 *  pointer to hover it with. You reach it by pressing Left from the first
 *  column, the way every TV app trains you to, and Right or Back puts you back.
 *
 *  While it is open the rest of the screen dims rather than disappears, so you
 *  keep your place.
 *
 *  The logo lives here rather than on every screen. It is not a destination, so
 *  spending the top-left corner of a 10-foot layout on it costs the hero room
 *  it can use. Collapsed the strip shows the mark; opened, the full wordmark
 *  arrives with the labels. */
export function TvSideMenu({
  open,
  index,
  active,
  onPick,
}: {
  open: boolean
  index: number
  active: string
  /** clicking an entry is the same as landing on it and pressing OK */
  onPick?: (i: number) => void
}) {
  return (
    <nav
      className={`absolute inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-tv-panel/94 backdrop-blur-xl transition-[width] duration-300 ${
        open ? 'w-[268px]' : 'w-[var(--tv-rail)]'
      }`}
    >
      <span className="flex h-[96px] shrink-0 items-center gap-[9px] ps-[24px]">
        <img src={mark} alt="" className="h-[26px] w-auto shrink-0" />
        <span
          className={`whitespace-nowrap text-[24px]/[28px] font-black tracking-[-0.03em] transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          antena<span className="font-light text-tv-fg/65">PLAY</span>
        </span>
      </span>

      <div className="flex flex-1 flex-col justify-center gap-[6px]">
      {MENU.map(({ key, label, Icon }, i) => {
        const focused = open && index === i
        return (
          <div
            key={key}
            onClick={() => onPick?.(i)}
            className={`relative mx-[10px] flex cursor-pointer items-center gap-[18px] rounded-[12px] px-[14px] py-[14px] transition-colors ${
              focused ? 'tv-focus bg-white/10' : ''
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-[26px] w-[4px] -translate-y-1/2 rounded-e-full bg-tv-action transition-opacity ${
                active === key && !focused ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <Icon
              className={`size-[26px] shrink-0 ${focused || active === key ? 'text-tv-fg' : 'text-tv-faint'}`}
            />
            <span
              className={`whitespace-nowrap text-[22px]/[28px] font-semibold transition-opacity duration-200 ${
                open ? 'opacity-100' : 'opacity-0'
              } ${focused || active === key ? 'text-tv-fg' : 'text-tv-dim'}`}
            >
              {label}
            </span>
          </div>
        )
      })}
      </div>
    </nav>
  )
}
