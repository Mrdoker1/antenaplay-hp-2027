import mark from '../assets/antena-mark.svg'

const LINKS = [
  'Ajutor clienți',
  'Termeni și Condiții',
  'Politica de confidențialitate',
  'Antena TV Group SA',
  'Program TV',
]

export function Footer3() {
  return (
    <footer className="v3-inset mt-[clamp(40px,4vw,72px)] border-t border-v3-line py-[34px]">
      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <span className="flex items-baseline gap-[7px]">
          <img src={mark} alt="" className="h-[17px] w-auto" />
          <span className="text-[17px]/[21px] font-black tracking-[-0.03em]">
            antena<span className="font-light text-v3-fg/65">PLAY</span>
          </span>
        </span>
        <ul className="flex flex-wrap gap-x-[22px] gap-y-[8px]">
          {LINKS.map((l) => (
            <li key={l}>
              <a href="#" className="text-[13px]/[19px] text-v3-faint transition-colors hover:text-v3-fg">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-[22px] font-meta text-[11px] uppercase tracking-[0.13em] text-v3-faint">
        © Acest site este parte a INTACT MEDIA GROUP
      </p>
    </footer>
  )
}
