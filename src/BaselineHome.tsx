import { BrandedRailSection } from './components/BrandedRailSection'
import { ChannelsSection } from './components/ChannelsSection'
import { Footer } from './components/Footer'
import { HeroCarousel } from './components/HeroCarousel'
import { LiveEventsSection } from './components/LiveEventsSection'
import { PosterRailSection } from './components/PosterRailSection'
import { SubscribeBar } from './components/SubscribeBar'
import { TopNav } from './components/TopNav'
import { TopTenSection } from './components/TopTenSection'
import { backdrops } from './data/backdrops'
import {
  asiaAmerica,
  filmeSerialeNoi,
  inCurand,
  insulaRomania,
  insulaTakeover,
  powerCouple,
  sport,
  top10,
  topFilme,
  topSeriale,
  topShowuri,
  trending,
} from './data/posters'

/** AntenaPLAY home page as it is today — a faithful rebuild of Figma node 1:2
 *  ("TV online in Romania"). Section order and geometry follow the file top to
 *  bottom. Kept alongside the 2027 skin so the pitch can show before/after on
 *  identical content. */
export default function BaselineHome() {
  return (
    <>
      <TopNav />
      <main>
        <HeroCarousel />
        <ChannelsSection />

        <PosterRailSection title="În curând" items={inCurand} />
        <PosterRailSection title="Trending în AntenaPLAY" items={trending} />
        <PosterRailSection title="Asia & America Express" items={asiaAmerica} />
        <PosterRailSection title="Insula Iubirii | România" items={insulaRomania} />

        <TopTenSection title="Top 10" items={top10} />
        <LiveEventsSection />
        <BrandedRailSection
          title="Mai multă Insula Iubirii"
          items={insulaTakeover}
          backdropHash={backdrops.insulaTakeover}
        />

        <TopTenSection title="Top filme" items={topFilme} />
        <PosterRailSection title="Filme și seriale noi în AntenaPLAY" items={filmeSerialeNoi} />
        <TopTenSection title="Top seriale" items={topSeriale} />
        <PosterRailSection title="AntenaPLAY Sport" items={sport} />
        <TopTenSection title="Top show-uri TV" items={topShowuri} />
        <PosterRailSection title="Power Couple România" items={powerCouple} />
      </main>
      <Footer />
      <SubscribeBar />
    </>
  )
}
