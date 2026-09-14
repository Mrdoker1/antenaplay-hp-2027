import { useMemo, useState } from 'react'
import { asset } from '../lib/assets'
import { IconSparkle } from './icons'
import { Sparks } from './Sparks'
import { taste, tasteDeck, type TasteCard } from './search'
import type { SmartSearch } from './useSmartSearch'

/** Teaching the assistant what you like, without typing.
 *
 *  The search panel is powerful and it asks something of you first: that you
 *  already know what you are in the mood for and can put it into words. Most
 *  evenings nobody does. Shown a poster, though, anyone can answer — yes or no
 *  — and a dozen of those answers is a phrase the viewer never had to compose.
 *
 *  Two things keep it from being a toy. The deck is the real catalogue, and
 *  the answers resolve into the same vocabulary a typed phrase does, so the
 *  readout is not a decoration: it is the query, being written. And the whole
 *  section closes — a first screen that demands a chore before it will show
 *  you anything is worse than one that never offered.
 *
 *  The queue is visible rather than one card at a time, because the width is
 *  there and because "how long does this go on for" is the first question
 *  anyone asked to do a chore has. Answered cards leave to the left, always to
 *  the left: the direction is the queue moving along, not the verdict. What
 *  you chose is said by the readout, which is where it does some work. */

/** Poster width, and the distance from one card to the next — the difference
 *  is the overlap that makes the row read as a queue rather than a shelf. */
const CARD_W = 152
/** Breathing room on every side but the right: the card being answered is
 *  lifted and ringed, and both need somewhere to go. The right edge stays
 *  tight, because that is where the queue is meant to run out of room. */
const PAD = 9
/** Half a card of offset: enough that every poster in the pile is readable,
 *  tight enough that the pile is a pile rather than a shelf. */
const STEP = 62
/** How far past the front card the queue is drawn. Past this they are behind
 *  the panel edge anyway. */
const VISIBLE = 8

export function TasteTuner({ s, onClose }: { s: SmartSearch; onClose: () => void }) {
  const deck = useMemo(() => tasteDeck(14), [])
  const [liked, setLiked] = useState<TasteCard[]>([])
  const [passed, setPassed] = useState<TasteCard[]>([])

  const seen = liked.length + passed.length
  const card = deck[seen] ?? null
  const read = useMemo(() => taste(liked, passed), [liked, passed])
  const done = !card

  /* What the column shows. While the deck lasts it is the queue, front card
     first; once it is spent it is what you kept, so the block keeps its height
     and ends on the answer rather than on a hole. */
  const pile = useMemo(() => {
    const source = done ? liked : deck
    const at = done ? 0 : seen
    const out: { item: TasteCard; d: number; gone: boolean; front: boolean }[] = []
    source.forEach((item, i) => {
      const d = i - at
      if (d < -1 || d > VISIBLE) return
      out.push({ item, d, gone: d < 0, front: d === 0 && !done })
    })
    return out
  }, [deck, liked, seen, done])

  /* Answering only moves the queue along. Every card's position is derived
     from how far it is from the front, so one state change animates the whole
     row — the answered card out to the left, the rest up by one. */
  const answer = (yes: boolean) => {
    if (!card) return
    if (yes) setLiked((prev) => [...prev, card])
    else setPassed((prev) => [...prev, card])
  }

  return (
    <section className="v3-inset mt-[clamp(28px,3vw,52px)]">
      {/* Isolated: the layers inside this block — the close button, the ramp
          over the pile — are stacked against each other, and without a
          stacking context of their own they compete with the page's overlays
          and end up drawn over the open search. */}
      <div className="relative isolate overflow-hidden rounded-[20px] border border-v3-line bg-v3-panel">
        {/* The assistant's own light, so the block reads as its surface rather
            than as one more shelf that happens to sit above the shelves. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(76% 120% at 6% 0%, rgba(160,107,255,0.16) 0%, transparent 62%), radial-gradient(50% 100% at 98% 100%, rgba(234,29,37,0.1) 0%, transparent 60%)',
          }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Închide secțiunea"
          className="absolute right-[14px] top-[14px] z-20 grid size-[32px] place-items-center rounded-full text-[17px] text-v3-faint transition-colors hover:bg-white/10 hover:text-v3-fg"
        >
          ✕
        </button>

        <div className="relative grid items-center gap-[clamp(16px,2vw,34px)] p-[clamp(18px,2.2vw,30px)] lg:grid-cols-[360px_1fr_320px]">
          {/* The pile. It leans out to the right and is cut off there, which is
              the whole of what it has to say: there are more of these than you
              are going to be asked about. The answered card leaves past the
              left edge, so this clips on both sides — and the column stays
              when the deck runs out, holding the block's height, with what you
              kept in it instead of what you are being asked.

              The recession is one gradient over the pile rather than opacity
              on each card: fading the cards makes the panel show through them
              and the whole thing goes grey and cheap, where a single ramp of
              the page's own ground reads as depth. */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: Math.round(CARD_W * 1.45) + PAD * 2 }}
          >
            {pile.map(({ item, d, gone, front }) => (
              <Poster
                key={item.key}
                card={item}
                front={front}
                style={{
                  width: CARD_W,
                  top: PAD,
                  bottom: PAD,
                  transform: gone
                    ? `translateX(${-CARD_W - 48}px) rotate(-6deg)`
                    : `translateX(${PAD + d * STEP}px)${front ? ' scale(1.04)' : ''}`,
                  opacity: gone ? 0 : 1,
                  zIndex: VISIBLE + 2 - d,
                }}
              />
            ))}
            {/* Only as wide as the pile: run to the full column and the last
                stretch is a ramp over bare panel, which reads as a black slab
                parked next to the cards once the deck is down to a few. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-40"
              style={{
                width: PAD * 2 + CARD_W + Math.max(0, pile.filter((p) => !p.gone).length - 1) * STEP,
                backgroundImage: `linear-gradient(to right, transparent ${PAD + CARD_W + 8}px, rgba(8,8,11,0.6) ${PAD + CARD_W + 54}px, rgba(8,8,11,0.9) 100%)`,
              }}
            />
          </div>

          <div className="min-w-0 pe-[20px]">
            <p className="flex items-center gap-[8px] text-[12px]/[18px] uppercase tracking-[0.14em] text-v3-ai">
              <IconSparkle className="size-[14px]" />
              Antrenează căutarea AI
            </p>
            <h2 className="mt-[8px] text-balance text-[clamp(21px,2vw,30px)]/[1.15] font-black tracking-[-0.025em]">
              {done ? 'Gata — asta cauți.' : 'Spune-i ce îți place.'}
            </h2>
            <p className="mt-[8px] max-w-[52ch] text-[14px]/[21px] text-v3-dim">
              {done
                ? 'Recomandările și căutarea pornesc de aici. Poți relua oricând.'
                : 'Răspunde da sau nu la câteva afișe. Nu trebuie să descrii nimic în cuvinte — căutarea AI se scrie singură, din ce alegi.'}
            </p>

            {done ? (
              <button
                type="button"
                onClick={() => {
                  setLiked([])
                  setPassed([])
                }}
                className="mt-[18px] rounded-[100px] border border-white/14 px-[18px] py-[10px] text-[13px]/[19px] font-semibold text-v3-dim transition-colors hover:border-white/30 hover:text-v3-fg"
              >
                Reia antrenamentul
              </button>
            ) : (
              <div className="mt-[18px] flex items-center gap-[12px]">
                <Vote tone="no" onClick={() => answer(false)} label="Nu mă atrage" />
                <Vote tone="yes" onClick={() => answer(true)} label="Îmi place" />
                {/* The title is on the card; what is written nowhere else is
                    how long this goes on for, and that is the question anyone
                    asked to do a chore has first. */}
                <p className="ms-[6px] font-meta text-[11px]/[17px] uppercase tracking-[0.12em] text-v3-faint">
                  {seen} din {deck.length}
                </p>
              </div>
            )}
          </div>

          {/* The query, being written. It is the payoff of the whole block:
              the answers are only worth giving if you can watch them turn
              into something the search will actually run. */}
          <aside className="flex min-w-0 flex-col items-start gap-[12px]">
            <h3 className="text-[12px]/[18px] uppercase tracking-[0.12em] text-v3-faint">
              Ce a înțeles
            </h3>
            {read.labels.length ? (
              <ul className="flex flex-wrap gap-[6px]">
                {read.labels.map((label) => (
                  <li
                    key={label}
                    className="rounded-[6px] bg-v3-ai/14 px-[8px] py-[3px] text-[11px]/[17px] font-medium uppercase tracking-[0.06em] text-v3-ai"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px]/[19px] text-v3-faint">
                Încă nimic. Primul „da" e de ajuns.
              </p>
            )}

            <button
              type="button"
              disabled={!read.phrase}
              onClick={() => s.ask(read.phrase)}
              className="mt-[4px] rounded-[100px] bg-v3-ai px-[18px] py-[11px] text-[13px]/[19px] font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-v3-faint"
            >
              Caută după gusturile mele
            </button>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Poster({
  card,
  front,
  style,
}: {
  card: TasteCard
  front: boolean
  style: React.CSSProperties
}) {
  const art = asset(card.art)
  return (
    <div
      style={style}
      aria-hidden={!front}
      className={`absolute left-0 transition-[transform,opacity] duration-[320ms] ease-out ${
        front ? 'drop-shadow-[0_18px_34px_rgba(0,0,0,0.62)]' : ''
      }`}
    >
      {/* The edge is a layer behind the card rather than a ring on it: the
          card is opaque and clips its own artwork, so a gradient painted
          under it shows only where it sticks out. */}
      {front && <span className="v3-ai-edge absolute -inset-[3px] rounded-[15px]" />}

      <div
        className={`absolute inset-0 overflow-hidden rounded-[12px] bg-v3-raised ${
          front ? '' : 'shadow-[0_12px_28px_rgba(0,0,0,0.5)]'
        }`}
      >
        {art && <img src={art} alt="" draggable={false} className="size-full object-cover" />}
        {front && (
          <>
            <Sparks />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-[10px] pt-[36px]">
              <p className="truncate text-[13px]/[18px] font-bold">{card.title}</p>
              <p className="truncate text-[11px]/[16px] text-v3-dim">{card.vibe}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Vote({ tone, onClick, label }: { tone: 'yes' | 'no'; onClick: () => void; label: string }) {
  const yes = tone === 'yes'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-[52px] place-items-center rounded-full border text-[20px] transition-colors ${
        yes
          ? 'border-v3-ai/50 text-v3-ai hover:bg-v3-ai/16'
          : 'border-white/16 text-v3-dim hover:bg-white/10 hover:text-v3-fg'
      }`}
    >
      {yes ? '♥' : '✕'}
    </button>
  )
}
