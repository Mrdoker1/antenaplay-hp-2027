/** Metadata reads as data: mono, uppercase, open tracking. Keeps it from
 *  competing with the title, which is the whole point of moving titles out of
 *  the artwork and into the UI layer. */
export function Meta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-meta text-[11px] uppercase tracking-[0.13em] text-fg-faint ${className}`}>
      {children}
    </p>
  )
}
