/** Generic UI glyphs for the rail and the header. Brand marks are never drawn
 *  here — those come from the exported assets. */
type P = { className?: string }

const box = (children: React.ReactNode, className = '') => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
)

export const IconHome = ({ className }: P) =>
  box(<path d="M4 10.5 12 4l8 6.5V20H4z" />, className)

export const IconSearch = ({ className }: P) =>
  box(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </>,
    className,
  )

export const IconLive = ({ className }: P) =>
  box(
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2" />
    </>,
    className,
  )

export const IconSport = ({ className }: P) =>
  box(
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 3.8v16.4M3.8 12h16.4" />
    </>,
    className,
  )

export const IconLibrary = ({ className }: P) =>
  box(
    <>
      <rect x="3.6" y="5" width="16.8" height="14" rx="2" />
      <path d="M8.2 5v14M15.8 5v14" />
    </>,
    className,
  )

export const IconProfile = ({ className }: P) =>
  box(
    <>
      <circle cx="12" cy="8.4" r="3.5" />
      <path d="M5.2 20c0-3.5 3-5.4 6.8-5.4S18.8 16.5 18.8 20" />
    </>,
    className,
  )

/** The assistant's mark. A four-point sparkle, the convention for "this was
 *  generated", so the AI surface is recognisable before you read a word. */
export const IconSparkle = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2.6l1.7 5.1a2 2 0 0 0 1.26 1.26L20.1 10.7l-5.14 1.74a2 2 0 0 0-1.26 1.26L12 18.84l-1.7-5.14a2 2 0 0 0-1.26-1.26L3.9 10.7l5.14-1.74A2 2 0 0 0 10.3 7.7z" />
    <path d="M19 16.4l.72 2.16 2.16.72-2.16.72L19 22.16l-.72-2.16-2.16-.72 2.16-.72z" />
  </svg>
)
