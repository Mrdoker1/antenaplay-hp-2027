/** Two glyphs the web skins did not need: the section icons AntenaPLAY's own
 *  TV app uses for Emisiuni and Seriale. */
const stroke = (children: React.ReactNode, className?: string) => (
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

export const IconShows = ({ className }: { className?: string }) =>
  stroke(
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.4" />
      <path d="M8 3.6 10.4 6M16 3.6 13.6 6M10.4 10.6l3.6 2-3.6 2z" />
    </>,
    className,
  )

export const IconSeries = ({ className }: { className?: string }) =>
  stroke(
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>,
    className,
  )
