import { useEffect, useState } from 'react'
import BaselineHome from './BaselineHome'
import Home2027 from './v2027/Home2027'
import Home3 from './v3ai/Home3'

type Skin = 'baseline' | 'v2027' | 'ai'

const KEY = 'antena.skin'
const SKINS: Skin[] = ['baseline', 'v2027', 'ai']

function initialSkin(): Skin {
  const fromUrl = new URLSearchParams(window.location.search).get('v')
  if (fromUrl === 'ai' || fromUrl === '2027ai') return 'ai'
  if (fromUrl === '2027') return 'v2027'
  if (fromUrl === 'baseline' || fromUrl === 'old') return 'baseline'
  const stored = localStorage.getItem(KEY) as Skin | null
  return stored && SKINS.includes(stored) ? stored : 'ai'
}

export default function App() {
  const [skin, setSkin] = useState<Skin>(initialSkin)

  useEffect(() => {
    localStorage.setItem(KEY, skin)
  }, [skin])

  return (
    <>
      {skin === 'ai' ? <Home3 /> : skin === 'v2027' ? <Home2027 /> : <BaselineHome />}
      <SkinSwitch skin={skin} onChange={setSkin} />
    </>
  )
}

/** Pitch affordance, not product chrome: flips the same content between the
 *  current visual language and the 2027 direction. */
function SkinSwitch({ skin, onChange }: { skin: Skin; onChange: (skin: Skin) => void }) {
  return (
    <div className="fixed bottom-[74px] right-[20px] z-[100] flex items-center gap-[2px] rounded-full border border-white/12 bg-black/70 p-[3px] backdrop-blur-xl">
      {(
        [
          ['baseline', 'Acum'],
          ['v2027', '2027'],
          ['ai', '2027 AI'],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={skin === value}
          className={`rounded-full px-[15px] py-[6px] font-mono text-[11px] uppercase tracking-[0.14em] transition ${
            skin === value ? 'bg-white text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
