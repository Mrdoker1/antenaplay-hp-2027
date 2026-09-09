import { asset } from '../lib/assets'
import { liveEvents } from '../data/liveEvents'
import { Badge } from './Badge'
import { PlayGlyph } from './PlayGlyph'
import { Meta } from './Meta'
import { Row } from './Row'
import { useColorFeed } from './colorFeedContext'
import { accentFromTitle } from './accent'

/** Live and sport.
 *
 *  Broadcast is the one thing a global streamer cannot copy, so it gets its own
 *  form: 16:9, a LIVE token with a pulsing dot, and a running clock line. The
 *  first card is treated as on-air to show the state; the rest are upcoming.
 *
 *  The caption sits *below* the frame rather than over it, unlike the VOD rows.
 *  These particular stills are graphic title cards with their own copy burnt in
 *  ("ANTRENAMENT", "CALIFICĂRI") — overlaying our type on theirs is the worst of
 *  both, and it is the clearest argument in the deck for clean key art. */
export function LiveRow2027() {
  const { feed } = useColorFeed()

  return (
    <Row title="Live & Sport" itemPitch={388}>
      {liveEvents.map((event, i) => {
        const onAir = i === 0
        const still = asset(event.still)
        const { a1, a2 } = accentFromTitle(event.title + event.when)

        return (
          <a
            key={`${event.title}-${event.when}-${i}`}
            href="#"
            className="group/card relative block w-[372px] shrink-0 spring transition-transform duration-500 hover:-translate-y-[6px] focus-visible:-translate-y-[6px]"
            onMouseEnter={() => feed(event.title, still)}
            onFocus={() => feed(event.title, still)}
          >
            <div
              className="art-surface relative aspect-video overflow-hidden rounded-card bg-s2 shadow-[0_2px_10px_rgba(0,0,0,0.35)] spring transition-shadow duration-500 group-hover/card:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.75)]"
              style={{
                backgroundImage: `radial-gradient(120% 100% at 18% 0%, hsl(${a1} / 0.5) 0%, transparent 66%), radial-gradient(110% 90% at 90% 100%, hsl(${a2} / 0.4) 0%, transparent 68%)`,
              }}
            >
              {still && (
                <img
                  src={still}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover spring transition-transform duration-700 group-hover/card:scale-[1.05]"
                />
              )}
              {/* just enough to seat the badge, not enough to fight the art */}
              <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/55 to-transparent" />

              <div className="absolute inset-x-[14px] top-[12px] flex items-center justify-between">
                {onAir ? <Badge kind="live" /> : <Meta className="text-white/80">{event.when.split(',')[0]}</Meta>}
                {onAir && <Meta className="text-white/80">min. 34</Meta>}
              </div>

              <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-400 group-hover/card:opacity-100">
                <span className="grid size-[52px] place-items-center rounded-full bg-white/95 text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
<PlayGlyph className="size-[20px]" />
                </span>
              </span>
            </div>

            <div className="h-[60px] pt-[12px]">
              <h3 className="truncate text-[16px]/[23px] font-semibold tracking-[-0.01em] text-fg">
                {event.title}
              </h3>
              <Meta className="mt-[3px] truncate">
                {event.competition}
                {'  ·  '}
                {onAir ? 'în direct' : event.when}
              </Meta>
            </div>
          </a>
        )
      })}
    </Row>
  )
}
