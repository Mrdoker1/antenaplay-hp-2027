import { useEffect, useState } from 'react'
import {
  asiaAmerica,
  filmeSerialeNoi,
  inCurand,
  insulaRomania,
  powerCouple,
  sport,
  top10,
  topFilme,
  topSeriale,
  trending,
} from '../data/posters'
import { Footer3 } from './Footer3'
import { Hero3 } from './Hero3'
import { LeftRail } from './LeftRail'
import { Rail3 } from './Rail3'
import { HeaderBar } from './HeaderBar'
import { useSmartSearch } from './useSmartSearch'

/** AntenaPLAY home page — 2027 · AI.
 *
 *  The third of three skins over the same content model. It keeps the second
 *  one's palette and content, takes its structure from the additional Figma
 *  mockups — left icon rail (10:74, 10:2, 10:246), floating header pill
 *  (12:1531), two-tone condensed display titles (10:246) — and is built around
 *  one feature the other two do not have: describing what you feel like
 *  watching instead of naming it (12:1530, 12:1866). */
export default function Home3() {
  const [section, setSection] = useState('home')
  const smart = useSmartSearch()

  useEffect(() => {
    document.documentElement.dataset.skin = 'v3ai'
    return () => {
      delete document.documentElement.dataset.skin
    }
  }, [])

  // the rail's search entry is the same surface as the header field
  const navigate = (key: string) => {
    if (key === 'search') {
      smart.setOpen(true)
      return
    }
    setSection(key)
  }

  return (
    <div className="v3ai">
      <LeftRail active={smart.open ? 'search' : section} onNavigate={navigate} />
      <HeaderBar s={smart} />

      <main className="pb-[20px]">
        <Hero3 />

        <Rail3 title="Trending în AntenaPLAY" items={trending} />
        <Rail3 title="Top 10 în România" items={top10.slice(0, 10)} lockup />
        <Rail3 title="Live & Sport" items={sport} />
        <Rail3 title="În curând" items={inCurand} />
        <Rail3 title="Filme și seriale noi" items={filmeSerialeNoi} />
        <Rail3 title="Insula Iubirii · universul complet" items={insulaRomania} />
        <Rail3 title="Asia & America Express" items={asiaAmerica} />
        <Rail3 title="Top filme" items={topFilme.slice(0, 10)} lockup />
        <Rail3 title="Top seriale" items={topSeriale.slice(0, 10)} lockup />
        <Rail3 title="Power Couple România" items={powerCouple} />
      </main>

      <Footer3 />
    </div>
  )
}
