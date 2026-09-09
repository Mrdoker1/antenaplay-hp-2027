import { Meta } from './Meta'
import { Wordmark } from './Wordmark'

const DEVICES = [
  'Laptop și desktop',
  'iPhone și iPad',
  'Android și Android TV',
  'Huawei',
  'Smart TV și Apple TV',
]

const COL_A = [
  'Ajutor clienți',
  'Contact',
  'Termeni și Condiții',
  'Politica de cookies',
  'Politica de confidențialitate',
  'Modifică setări confidențialitate',
]

const COL_B = ['Antena TV Group SA', 'Cod deontologic', 'Date companie', 'CNA', 'ANPC']
const COL_C = ['Program TV', 'a1.ro', 'Observator News', 'SAL și SOL', 'Trends AntenaPLAY']

/** Same links as the baseline footer, on the new type and surface system. */
export function Footer2027() {
  return (
    <footer className="page-pad mt-[clamp(56px,6vw,104px)] border-t border-white/8 pb-[80px] pt-[52px]">
      <div className="flex flex-wrap items-start justify-between gap-[40px]">
        <div>
          <a href="#" className="inline-block">
            <Wordmark size={20} />
          </a>
          <Meta className="mt-[18px]">Disponibil pe</Meta>
          <ul className="mt-[10px] flex flex-wrap gap-[8px]">
            {DEVICES.map((device) => (
              <li
                key={device}
                className="rounded-full bg-s2 px-[13px] py-[7px] text-[12px]/[16px] text-fg-muted"
              >
                {device}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-[clamp(28px,4vw,72px)]">
          <LinkColumn items={COL_A} />
          <LinkColumn items={COL_B} />
          <LinkColumn items={COL_C} />
        </div>
      </div>

      <Meta className="mt-[44px]">© Acest site este parte a INTACT MEDIA GROUP</Meta>
    </footer>
  )
}

function LinkColumn({ items }: { items: string[] }) {
  return (
    <ul className="space-y-[9px]">
      {items.map((item) => (
        <li key={item}>
          <a href="#" className="text-[13px]/[18px] text-fg-muted transition hover:text-fg">
            {item}
          </a>
        </li>
      ))}
    </ul>
  )
}
