import { useEffect, useState } from 'react'
import { accentFromTitle } from './accent'
import { ColorFeedProvider } from './ColorFeed'
import { ChannelTile } from './ChannelTile'
import { Footer2027 } from './Footer2027'
import { Hero2027 } from './Hero2027'
import { LiveRow2027 } from './LiveRow2027'
import { Nav2027 } from './Nav2027'
import { Row } from './Row'
import { TitleCard } from './TitleCard'
import { Takeover2027 } from './Takeover2027'
import { TopTen2027 } from './TopTen2027'
import { WideCard } from './WideCard'
import { backdrops } from '../data/backdrops'
import { channelsFree, channelsTv, rows } from './catalog'

const BASE = accentFromTitle('antenaplay')

/** AntenaPLAY home page — 2027 visual direction.
 *
 *  Same content model as the baseline (src/data, straight out of Figma node
 *  1:2) and the same section inventory. What changes is the visual language:
 *  titles in the UI layer instead of burnt into the art, one type hierarchy,
 *  four raised surfaces with grain instead of flat black, colour fed from the
 *  focused tile, one badge system, deliberate 2:3 / 16:9 split, no tile borders,
 *  wider gutters with fewer and larger cards, and motion on scroll and focus. */
function initialTheme(): 'dark' | 'light' {
  return new URLSearchParams(window.location.search).get('theme') === 'light' ? 'light' : 'dark'
}

export default function Home2027() {
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

  return (
    <ColorFeedProvider initial={BASE}>
      <>
        <Nav2027 theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />

        <main className="pb-[40px]">
          <Hero2027 />

          <Row title="Continuă de unde ai rămas" itemPitch={388} seeAll={false}>
            {rows.continueWatching.map((item, i) => (
              <WideCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <LiveRow2027 />

          <Row title="Canale TV" itemPitch={302}>
            {channelsTv.map((channel, i) => (
              <ChannelTile key={`${channel.name}-${i}`} channel={channel} />
            ))}
          </Row>

          <Row title="Trending în AntenaPLAY" itemPitch={248}>
            {rows.trending.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top 10 în România" items={rows.top10} />

          <Row title="Momente nedifuzate la TV" itemPitch={248}>
            {rows.extras.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="În curând" itemPitch={248}>
            {rows.inCurand.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Takeover2027
            title="Insula Iubirii · universul complet"
            items={rows.insulaRomania}
            backdropHash={backdrops.insulaTakeover}
          />

          <Row title="Asia & America Express" itemPitch={248}>
            {rows.asiaAmerica.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <Row title="Filme și seriale noi" itemPitch={248}>
            {rows.filmeSerialeNoi.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top filme" items={rows.topFilme} />

          <Row title="AntenaPLAY Sport" itemPitch={248}>
            {rows.sport.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top seriale" items={rows.topSeriale} />

          <Row title="Power Couple România" itemPitch={248}>
            {rows.powerCouple.map((item, i) => (
              <TitleCard key={`${item.title}-${i}`} item={item} />
            ))}
          </Row>

          <TopTen2027 title="Top show-uri TV" items={rows.topShowuri} />

          <Row title="Canale gratuite" itemPitch={302}>
            {channelsFree.map((channel, i) => (
              <ChannelTile key={`${channel.name}-${i}`} channel={channel} />
            ))}
          </Row>
        </main>

        <Footer2027 />
      </>
    </ColorFeedProvider>
  )
}
