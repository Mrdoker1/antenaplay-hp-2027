import { MENU } from './menu'

/** The side menu.
 *
 *  Collapsed to a strip of icons until it has the remote, then it slides out
 *  with labels — which is the only way a menu can work here, since there is no
 *  pointer to hover it with. You reach it by pressing Left from the first
 *  column, the way every TV app trains you to, and Right or Back puts you back.
 *
 *  While it is open the rest of the screen dims rather than disappears, so you
 *  keep your place. */
export function TvSideMenu({
  open,
  index,
  active,
}: {
  open: boolean
  index: number
  active: string
}) {
  return (
    <nav
      className={`absolute inset-y-0 left-0 z-40 flex flex-col justify-center gap-[6px] bg-tv-panel/94 backdrop-blur-xl transition-[width] duration-300 ${
        open ? 'w-[268px]' : 'w-[var(--tv-rail)]'
      }`}
    >
      {MENU.map(({ key, label, Icon }, i) => {
        const focused = open && index === i
        return (
          <div
            key={key}
            className={`relative mx-[10px] flex items-center gap-[18px] rounded-[12px] px-[14px] py-[14px] transition-colors ${
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
    </nav>
  )
}
