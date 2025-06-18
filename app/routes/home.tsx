import { MonitorSellsSection } from '@/components/monitor-sells/section'
import { Slogan } from '@/components/slogan'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Home' }]
}

export default function Home() {
  return (
    <div className="grid xs:grid-rows-2 3xl:grid-cols-1 gap-30">
      <Slogan />
      <MonitorSellsSection />
    </div>
  )
}
