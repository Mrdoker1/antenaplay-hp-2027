import { useEffect, useState } from 'react'
import { rows } from '../v2027/catalog'
import { Row } from '../v2027/Row'
import { TitleCard } from '../v2027/TitleCard'
import { TopTen2027 } from '../v2027/TopTen2027'
import { Footer3 } from './Footer3'
import { HeaderBar } from './HeaderBar'
import { Hero3 } from './Hero3'
import { LeftRail } from './LeftRail'
import { useSmartSearch } from './useSmartSearch'

/** AntenaPLAY home page — 2027 · AI.
 *
 *  The third of three skins over the same content model. Structure comes from
 *  the additional Figma mockups — left icon rail (10:74, 10:2, 10:246),
 *  floating header pill (12:1531) — and it is built around one feature the
 *  other two do not have: describing what you feel like watching instead of
 *  naming it (12:1530, 12:1866).
 *
 *  The rows are the second skin's, used directly rather than reimplemented:
 *  `Row`, `TitleCard` and `TopTen2027`, inside a `.v2027` wrapper so their own
 *  cascade applies too. The wrapper only adds what this layout needs — the
 *  offset past the left rail — and drops the background so the page ground
 *  stays this skin's. */
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

        <div className="v2027 bg-transparent ps-[var(--v3-rail)]">
          <Row title="Continuă de unde ai rămas" itemPitch={248} seeAll={false}>
            {rows.continueWatching.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="Trending în AntenaPLAY" itemPitch={248}>
            {rows.trending.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top 10 în România" items={rows.top10} />

          <Row title="AntenaPLAY Sport" itemPitch={248}>
            {rows.sport.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="În curând" itemPitch={248}>
            {rows.inCurand.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="Momente nedifuzate la TV" itemPitch={248}>
            {rows.extras.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="Filme și seriale noi" itemPitch={248}>
            {rows.filmeSerialeNoi.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top filme" items={rows.topFilme} />

          <Row title="Insula Iubirii · universul complet" itemPitch={248}>
            {rows.insulaRomania.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="Asia & America Express" itemPitch={248}>
            {rows.asiaAmerica.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top seriale" items={rows.topSeriale} />

          <Row title="Power Couple România" itemPitch={248}>
            {rows.powerCouple.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>
        </div>
      </main>

      <Footer3 />
    </div>
  )
}
