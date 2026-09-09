import { asset } from '../lib/assets'

const LEFT = ['Live', 'Sport', 'Emisiuni', 'Noutăți']
const RIGHT = ['Seriale', 'Filme']

/** Figma node 1:3342 — 85.648px bar on #161616 with a #333 hairline, nav
 *  links at 16px/24 uppercase, the wordmark centred, and the sign-in pill
 *  outlined in brand red. */
export function TopNav() {
  const wordmark = asset('44ebc9909dc40ee1990fa73728aa8015a328ff77')
  const antena1 = asset('df26ee758deb6dcaaa04292fdc8554622ced4791')

  return (
    <header className="sticky top-0 z-50 h-[85.648px] border-b border-hairline bg-ink">
      <div className="page-gutter relative flex h-full items-center justify-between">
        <NavList items={LEFT} />

        {/* centred lockup: Antena 1 badge over the antenaPLAY wordmark */}
        <a
          href="#"
          className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 flex-col items-center justify-center gap-[3px]"
          aria-label="AntenaPLAY"
        >
          {antena1 ? (
            <img src={antena1} alt="" className="h-[21px] w-[84px] object-contain" />
          ) : (
            <span className="rounded-[2px] bg-brand px-[8px] py-[1px] text-[12px]/[16px] font-semibold tracking-[0.6px]">
              antena
            </span>
          )}
          {wordmark ? (
            <img src={wordmark} alt="AntenaPLAY" className="h-[32px] w-[257px] object-contain" />
          ) : (
            <span className="text-[26px]/[32px] font-black tracking-[-0.5px]">
              antena<span className="font-light text-white/70">PLAY</span>
            </span>
          )}
        </a>

        <div className="flex items-center">
          <NavList items={RIGHT} />
          <IconButton label="Căutare" hash="59d5643cb720cde83a4394ce15a94dc956f54ab8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.35-4.35" strokeLinecap="round" />
          </IconButton>
          <IconButton label="Notificări" hash="de66b2f084e3350d390ee4734cf9a0221c407052">
            <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" strokeLinejoin="round" />
            <path d="M10.3 20a2 2 0 0 0 3.4 0" strokeLinecap="round" />
          </IconButton>
          <IconButton label="Contul meu" hash="aa0f16456256f3a1532883a29d4424b26703aca2">
            <circle cx="12" cy="8" r="3.6" />
            <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" strokeLinecap="round" />
          </IconButton>
          <a
            href="#"
            className="ml-[15px] rounded-[50px] border border-brand px-[16px] py-[8px] text-[15px]/[18px] font-bold uppercase tracking-[0.5px] text-brand transition hover:bg-brand hover:text-white"
          >
            Autentifică-te!
          </a>
        </div>
      </div>
    </header>
  )
}

function NavList({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center">
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="px-[15px] text-[16px]/[24px] uppercase tracking-[0.2px] text-white transition first:pl-0 hover:text-brand"
        >
          {item}
        </a>
      ))}
    </nav>
  )
}

/** Uses the Figma export when it is on disk; the inline path is the fallback
 *  for a hash that has not been pulled down. */
function IconButton({
  label,
  hash,
  children,
}: {
  label: string
  hash: string
  children: React.ReactNode
}) {
  const exported = asset(hash)
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-[50px] place-items-center text-white/90 transition hover:text-brand"
    >
      {exported ? (
        <img src={exported} alt="" className="size-[20px] object-contain" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="1.7">
          {children}
        </svg>
      )}
    </button>
  )
}
