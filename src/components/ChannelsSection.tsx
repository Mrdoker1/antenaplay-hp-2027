import { canaleGratuite, canaleTv } from '../data/channels'
import type { Channel } from '../data/types'
import { ChannelCard } from './ChannelCard'
import { Rail } from './Rail'
import { SectionHeading } from './SectionHeading'

function ChannelRail({ title, items }: { title: string; items: Channel[] }) {
  return (
    <>
      <SectionHeading dot>{title}</SectionHeading>
      <Rail itemPitch={266} height={152} className="mt-[4px]">
        {items.map((channel, i) => (
          <div key={`${channel.name}-${i}`} className="pr-[8px]">
            <ChannelCard channel={channel} />
          </div>
        ))}
      </Rail>
    </>
  )
}

export function ChannelsSection() {
  return (
    <section className="pt-[50px]">
      <ChannelRail title="Canale TV" items={canaleTv} />
      <div className="mt-[35px]">
        <ChannelRail title="Canale Gratuite" items={canaleGratuite} />
      </div>
    </section>
  )
}
