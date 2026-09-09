import type { BadgeKind } from './catalog'

/** One badge component, four tokens. The old page had five differently-sized,
 *  differently-coloured stickers; these share a weight, a position and a
 *  surface, and only LIVE is allowed to use colour.
 *
 *  All the non-live badges sit on a dark translucent base rather than a light
 *  one. A badge lands on artwork nobody chose for it — a white/14 surface
 *  vanished over a bright sky — so the base has to hold on its own and the
 *  label carries the difference in meaning. */
const STYLES: Record<Exclude<BadgeKind, null>, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-brand/90 text-white' },
  new: { label: 'Nou', className: 'bg-black/55 text-white backdrop-blur-sm' },
  free: { label: 'Gratuit', className: 'bg-black/55 text-white/80 backdrop-blur-sm' },
  soon: { label: 'În curând', className: 'bg-black/55 text-white backdrop-blur-sm' },
}

export function Badge({ kind }: { kind: BadgeKind }) {
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
