import { IconHome, IconLibrary, IconLive, IconProfile, IconSearch, IconSport } from './icons'

const ITEMS = [
  { key: 'home', label: 'Acasă', Icon: IconHome },
  { key: 'search', label: 'Caută', Icon: IconSearch },
  { key: 'live', label: 'Live', Icon: IconLive },
  { key: 'sport', label: 'Sport', Icon: IconSport },
  { key: 'list', label: 'Lista mea', Icon: IconLibrary },
] as const

/** The left icon rail, the structural signature of the additional mockups
 *  (Figma 10:74, 10:2, 10:246).
 *
 *  It replaces the top nav of the other two skins, which frees the whole top
 *  edge for the one thing this version is about: the search field. The rail
 *  widens on hover to show labels, so it costs no width at rest but is not a
 *  guessing game either. */
export function LeftRail({
  active,
  onNavigate,
}: {
  active: string
  onNavigate: (key: string) => void
}) {
  return (
    <nav className="group/rail fixed inset-y-0 left-0 z-40 flex w-[var(--v3-rail)] flex-col items-start bg-v3-panel/80 backdrop-blur-xl transition-[width] duration-300 hover:w-[232px] focus-within:w-[232px]">
      {/* The rail sits beside the header rather than under it, so this only
          needs to line the first item up with the wordmark: the header pill
          spans 20→108, and a 56px item centred on that starts at 36. */}
      <div className="h-[36px] w-full shrink-0" />

      <ul className="flex w-full flex-col gap-[4px]">
        {ITEMS.map(({ key, label, Icon }) => {
          const on = active === key
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={on}
                className={`relative flex h-[56px] w-full items-center gap-[18px] ps-[30px] transition-colors ${
                  on ? 'text-v3-fg' : 'text-v3-faint hover:text-v3-fg'
                }`}
              >
                {/* the active marker is the brand red, as in node 10:2 */}
                <span
                  className={`absolute left-0 top-1/2 h-[26px] w-[3px] -translate-y-1/2 rounded-e-full bg-v3-action transition-opacity ${
                    on ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
                <Icon className="size-[22px] shrink-0" />
                <span className="whitespace-nowrap text-[14px]/[20px] font-medium opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto w-full pb-[26px]">
        <button
          type="button"
          className="flex h-[56px] w-full items-center gap-[18px] ps-[30px] text-v3-faint transition-colors hover:text-v3-fg"
        >
          <IconProfile className="size-[22px] shrink-0" />
          <span className="whitespace-nowrap text-[14px]/[20px] font-medium opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
            Contul meu
          </span>
        </button>
      </div>
    </nav>
  )
}
