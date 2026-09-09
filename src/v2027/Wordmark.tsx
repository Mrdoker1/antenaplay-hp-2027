import mark from '../assets/antena-mark.svg'

/** The AntenaPLAY lockup: the compact "a" mark leading a typeset wordmark.
 *  Shared by the header and the footer so the two can never drift apart. */
export function Wordmark({ size = 21 }: { size?: number }) {
  return (
    <span className="flex items-baseline gap-[1px]" aria-label="AntenaPLAY">
      <img
        src={mark}
        alt=""
        // the mark is 354×421, so it is taller than it is wide; sizing by height
        // and letting width follow keeps it from being squashed
        style={{ height: Math.round(size * 0.82), width: 'auto' }}
        className="me-[6px] self-center"
      />
      <span
        className="font-black tracking-[-0.03em]"
        style={{ fontSize: size, lineHeight: `${Math.round(size * 1.14)}px` }}
      >
        antena
      </span>
      <span
        className="font-light tracking-[-0.01em] text-fg/65"
        style={{ fontSize: size, lineHeight: `${Math.round(size * 1.14)}px` }}
      >
        PLAY
      </span>
    </span>
  )
}
