import type { BadgeKind } from '../v2027/catalog'

/** The badge system of the second skin, in this one's palette: one weight, one
 *  position, a dark translucent base that holds over any artwork, and colour
 *  reserved for LIVE. */
const STYLES: Record<Exclude<BadgeKind, null>, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-v3-action/90 text-white' },
  new: { label: 'Nou', className: 'bg-black/55 text-white backdrop-blur-sm' },
  free: { label: 'Gratuit', className: 'bg-black/55 text-white/80 backdrop-blur-sm' },
  soon: { label: 'În curând', className: 'bg-black/55 text-white backdrop-blur-sm' },
}

export function Badge3({ kind }: { kind: BadgeKind }) {
  if (!kind) return null
  const { label, className } = STYLES[kind]

  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full px-[9px] py-[3px] font-meta text-[10px] font-medium uppercase tracking-[0.14em] ${className}`}
    >
      {kind === 'live' && (
        <span className="relative grid size-[5px] place-items-center">
          <span className="absolute size-full animate-ping rounded-full bg-white/80" />
          <span className="size-full rounded-full bg-white" />
        </span>
      )}
      {label}
    </span>
  )
}
