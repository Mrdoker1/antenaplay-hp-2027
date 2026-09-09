/** Figma node 1:3419 — the promo strip that rides the bottom of the viewport:
 *  #161616 with a -3px/12.5px lift, red copy, red outlined pill. */
export function SubscribeBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-[10px] bg-ink px-[23px] py-[10px] shadow-[0_-3px_12.5px_#161616]">
      <p className="pr-[16px] text-[15px]/[15px] font-semibold tracking-[0.2px] text-brand">
        Emisiuni fenomen, filme cu super actori, seriale noi
      </p>
      <a
        href="#"
        className="rounded-[50px] border border-brand px-[16px] py-[8px] text-[15px]/[18px] font-bold uppercase tracking-[0.5px] text-brand transition hover:bg-brand hover:text-white"
      >
        Vezi abonamente
      </a>
    </div>
  )
}
