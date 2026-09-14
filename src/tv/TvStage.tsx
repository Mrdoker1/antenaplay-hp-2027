import { useEffect, useState } from 'react'

const W = 1280
const H = 720

/** The TV screen itself.
 *
 *  The layout is authored once at 1280×720 and scaled to whatever window it is
 *  shown in, which is how a TV app is actually built — a 4K panel runs the same
 *  layout at a different scale, not a different layout. It also means every
 *  size in this folder is a real design pixel, so "nothing under 28px" is a
 *  claim that can be checked rather than hoped for. */
export function TvStage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="tv fixed inset-0 grid place-items-center overflow-hidden bg-black">
      <div
        className="tv relative overflow-hidden"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        {children}
      </div>
    </div>
  )
}
