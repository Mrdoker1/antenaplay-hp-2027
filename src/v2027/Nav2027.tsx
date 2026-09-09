import { useEffect, useState } from 'react'
import { Wordmark } from './Wordmark'

const LINKS = ['Acasă', 'Live', 'Sport', 'Emisiuni', 'Seriale', 'Filme']

/** Sticky header that floats over the content instead of sitting on a solid
 *  bar: transparent at the top of the hero, translucent + blurred once the page
 *  moves. Same links as the baseline, restyled. */
export function Nav2027({
  theme,
  onToggleTheme,
}: {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const [lifted, setLifted] = useState(false)
  const [active, setActive] = useState('Acasă')

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        lifted
          ? 'bg-s0/72 backdrop-blur-xl'
          : // over the hero the header has no surface of its own, and hero key
            // art is dark whatever the theme is — so pin the foreground to its
            // dark values rather than letting a light theme paint it black on
            // black. Once lifted it follows the theme again.
            'art-surface bg-transparent'
      }`}
    >
      <div className="page-pad flex h-[74px] items-center gap-[clamp(20px,3vw,52px)]">
        <a href="#" className="shrink-0">
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-[clamp(14px,1.7vw,30px)] md:flex">
          {LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => setActive(link)}
              aria-current={active === link}
              className={`relative py-[6px] text-[14px]/[20px] font-medium tracking-[-0.005em] transition-colors ${
                active === link ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {link}
              {active === link && (
                <span className="absolute inset-x-0 -bottom-[2px] h-[2px] rounded-full bg-brand" />
              )}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-[6px]">
          <IconButton label="Căutare">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.35-4.35" strokeLinecap="round" />
          </IconButton>
          <IconButton label={theme === 'dark' ? 'Temă deschisă' : 'Temă întunecată'} onClick={onToggleTheme}>
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10L5.6 18.4" strokeLinecap="round" />
              </>
            ) : (
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
            )}
          </IconButton>
          <IconButton label="Notificări">
            <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" strokeLinejoin="round" />
            <path d="M10.3 20a2 2 0 0 0 3.4 0" strokeLinecap="round" />
          </IconButton>
          <a
            href="#"
            className="ms-[6px] rounded-full bg-brand px-[18px] py-[9px] text-[13px]/[16px] font-bold tracking-[0.02em] text-white transition hover:bg-brand-hi"
          >
            Autentifică-te
          </a>
        </div>
      </div>
    </header>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-[38px] place-items-center rounded-full text-fg-muted transition hover:bg-white/8 hover:text-fg"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
        {children}
      </svg>
    </button>
  )
}
