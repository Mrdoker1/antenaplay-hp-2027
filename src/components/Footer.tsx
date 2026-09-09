const DEVICES = [
  'Laptop și desktop',
  'iPhone și iPad',
  'Aplicație Android și Android TV',
  'Aplicație Huawei',
  'Smart TV și Apple TV',
]

const LINKS_LEFT = [
  'Ajutor clienți',
  'Contact',
  'Termeni și Condiții',
  'Politica de cookies',
  'Politica de confidențialitate',
  'Modifică setări confidențialitate',
  'Antena TV Group SA',
  'Cod deontologic',
]

const LINKS_RIGHT = [
  'Date companie',
  'CNA',
  'ANPC',
  'Program TV',
  'a1.ro',
  'Observator News',
  'SAL și SOL',
  'Trends AntenaPLAY',
]

/** Figma node 1:3166 — 429px footer: wordmark + social row, then the
 *  "Disponibil pe:" device strip beside two link columns, then the credit. */
export function Footer() {
  return (
    <footer className="page-gutter pb-[120px] pt-[52px]">
      <div className="flex flex-wrap items-center justify-between gap-[24px]">
        <span className="text-[22px]/[32px] font-black tracking-[-0.4px]">
          antena<span className="font-light text-white/70">PLAY</span>
        </span>
        <div className="flex items-center gap-[12px]">
          {['Facebook', 'Instagram', 'YouTube', 'TikTok'].map((network) => (
            <a
              key={network}
              href="#"
              aria-label={network}
              className="grid size-[30px] place-items-center rounded-full border border-white/25 text-[11px] font-bold text-white/70 transition hover:border-white hover:text-white"
            >
              {network[0]}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-[40px] flex flex-wrap justify-between">
        <div className="w-[953.86px] max-w-full shrink">
          <p className="text-[19px]/[30px] font-semibold">Disponibil pe:</p>
          <ul className="mt-[18px] flex flex-wrap gap-[17px]">
            {DEVICES.map((device) => (
              <li key={device} className="w-[142px]">
                <div className="grid h-[58px] w-[88px] place-items-center rounded-[4px] border border-white/15 bg-ink-raised">
                  <svg viewBox="0 0 24 24" className="size-[22px] text-white/45" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="18" height="12" rx="1.5" />
                    <path d="M8 20h8" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-[10px] text-[13px]/[16px] text-muted">{device}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-[635.9px] max-w-full shrink gap-[24px]">
          <LinkColumn items={LINKS_LEFT} />
          <LinkColumn items={LINKS_RIGHT} />
        </div>
      </div>

      <p className="mt-[40px] text-[15px]/[21px] text-muted">
        © Acest site este parte a INTACT MEDIA GROUP
      </p>
    </footer>
  )
}

function LinkColumn({ items }: { items: string[] }) {
  return (
    <ul className="flex-1 space-y-[5px]">
      {items.map((item) => (
        <li key={item}>
          <a href="#" className="text-[15px]/[21px] text-muted transition hover:text-white">
            {item}
          </a>
        </li>
      ))}
    </ul>
  )
}
