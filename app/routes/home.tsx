import { MonitorSellsSection } from '@/components/monitor-sells/section'
import { Slogan } from '@/components/slogan'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'T Labs' }, { name: 'description', content: 'T Labs' }]
}

export default function Home() {
  return (
    <>
      <div className="grid xs:grid-rows-2 3xl:grid-cols-1 gap-30">
        <Slogan />
        <MonitorSellsSection />
      </div>
    </>
  )
}
