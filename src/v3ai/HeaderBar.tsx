import { createPortal } from 'react-dom'
import mark from '../assets/antena-mark.svg'
import { IconSparkle } from './icons'
import { SearchPanel } from './SearchPanel'
import type { SmartSearch } from './useSmartSearch'

const SECTIONS = ['Emisiuni', 'Seriale', 'Filme', 'Genuri']

/** The header.
 *
 *  One surface, not two. The bar and the search results live in the same
 *  rounded container, and opening the search grows that container rather than
 *  dropping a separate card beneath it — so the thing you clicked is the thing
 *  that expanded.
 *
 *  The height animates on `grid-template-rows: 0fr → 1fr`, which interpolates a
 *  real height without measuring the content or hard-coding one. Where a
 *  browser cannot tween `fr`, the two states still work; only the tween is
 *  lost. */
export function HeaderBar({ s }: { s: SmartSearch }) {
  const { open, setOpen } = s

  return (
    <header className="fixed inset-x-0 top-0 z-40 ps-[var(--v3-rail)]">
      {/* Click-away scrim, portalled to the body: rendered in place it would
          sit inside the header's own stacking context and dim the header. */}
      {open &&
        createPortal(
          <button
            type="button"
            aria-label="Închide căutarea"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-black/55 backdrop-blur-sm"
          />,
          document.body,
        )}

      <div className="px-[clamp(16px,2vw,32px)] pt-[20px]">
        <div
          className={`v3-glass relative overflow-hidden rounded-[24px] transition-[box-shadow,border-color] duration-500 ${
            open ? 'shadow-[0_28px_80px_-20px_rgba(0,0,0,0.9)]' : ''
          }`}
        >
          <div className="flex items-center gap-[clamp(14px,2vw,28px)] px-[clamp(18px,2.4vw,36px)] py-[16px]">
            <a href="#" className="flex shrink-0 items-baseline gap-[7px]" aria-label="AntenaPLAY">
              <img src={mark} alt="" className="h-[19px] w-auto" />
              <span className="hidden text-[18px]/[22px] font-black tracking-[-0.03em] sm:block">
                antena<span className="font-light text-v3-fg/65">PLAY</span>
              </span>
            </a>

            <SearchField s={s} />

            <nav
              className={`hidden shrink-0 items-center gap-[clamp(12px,1.4vw,22px)] transition-all duration-400 lg:flex ${
                open ? 'pointer-events-none -translate-y-1 opacity-0' : 'opacity-100'
              }`}
            >
              {SECTIONS.map((section) => (
                <a
                  key={section}
                  href="#"
                  className="text-[14px]/[20px] font-medium text-v3-dim transition-colors hover:text-v3-fg"
                >
                  {section}
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

          {/* the collapsible half of the same surface */}
          <div
            className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`transition-all duration-400 ${
                  open ? 'translate-y-0 opacity-100 delay-100' : '-translate-y-2 opacity-0'
                }`}
              >
                <SearchPanel s={s} onClose={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function SearchField({ s }: { s: SmartSearch }) {
  const { open, setOpen, query, setQuery, thinking, inputRef } = s

  return (
    <div
      className={`flex h-[56px] min-w-0 flex-1 items-center gap-[12px] rounded-[100px] px-[24px] transition-[background-color,box-shadow] duration-400 ${
        open ? 'v3-ai-ring' : 'bg-white/6 hover:bg-white/10'
      }`}
    >
      <IconSparkle className={`size-[20px] shrink-0 text-v3-fg ${thinking ? 'v3-thinking' : ''}`} />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Descrie ce vrei să vezi..."
        aria-label="Căutare AI în catalog"
        aria-expanded={open}
        className="min-w-0 flex-1 bg-transparent text-[16px]/[24px] text-v3-fg outline-none placeholder:text-v3-faint"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Șterge"
          className="shrink-0 text-v3-faint transition-colors hover:text-v3-fg"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <kbd className="hidden shrink-0 rounded-[6px] border border-v3-line px-[7px] py-[2px] font-meta text-[11px] text-v3-faint md:block">
          /
        </kbd>
      )}
    </div>
  )
}
