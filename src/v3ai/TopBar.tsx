import mark from '../assets/antena-mark.svg'
import { SmartSearch } from './SmartSearch'

const SECTIONS = ['Emisiuni', 'Seriale', 'Filme', 'Genuri']

/** The floating header pill from Figma 12:1531: inset from the edges, dark and
 *  blurred rather than welded to the top of the page, and holding the search
 *  field as its centre of gravity. Section links sit to the right; primary
 *  navigation lives in the left rail. */
export function TopBar({
  searchOpen,
  onSearchOpenChange,
}: {
  searchOpen: boolean
  onSearchOpenChange: (v: boolean) => void
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 ps-[var(--v3-rail)]">
      <div className="relative px-[clamp(16px,2vw,32px)] pt-[20px]">
        <div className="v3-glass relative flex items-center gap-[clamp(14px,2vw,28px)] rounded-[24px] px-[clamp(18px,2.4vw,36px)] py-[16px]">
          <a href="#" className="flex shrink-0 items-baseline gap-[7px]" aria-label="AntenaPLAY">
            <img src={mark} alt="" className="h-[19px] w-auto" />
            <span className="hidden text-[18px]/[22px] font-black tracking-[-0.03em] sm:block">
              antena<span className="font-light text-v3-fg/65">PLAY</span>
            </span>
          </a>

          <SmartSearch open={searchOpen} onOpenChange={onSearchOpenChange} />

          <nav className="hidden shrink-0 items-center gap-[clamp(12px,1.4vw,22px)] lg:flex">
            {SECTIONS.map((s) => (
              <a
                key={s}
                href="#"
                className="text-[14px]/[20px] font-medium text-v3-dim transition-colors hover:text-v3-fg"
              >
                {s}
              </a>
            ))}
          </nav>

          <a
            href="#"
            className="shrink-0 rounded-[100px] bg-v3-action px-[18px] py-[9px] text-[13px]/[16px] font-bold text-white transition-colors hover:brightness-110"
          >
            Autentifică-te
          </a>
        </div>
      </div>
    </header>
  )
}
