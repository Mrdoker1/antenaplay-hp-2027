/** Stand-in for a Figma export that has not been pulled down yet.
 *  Deliberately plain: a dim play mark on the card surface, so an
 *  un-exported card still reads as a card without inventing artwork. */
export function Placeholder({ className = '' }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-ink-raised ${className}`}>
      <svg viewBox="0 0 24 24" className="w-[18%] max-w-[64px] text-white/10" aria-hidden>
        <path fill="currentColor" d="M9 6.5v11l9-5.5-9-5.5Z" />
        <circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  )
}
