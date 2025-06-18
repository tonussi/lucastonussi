import { MainSlogan } from '@/components/main-slogan'
import { MonitorSellsSection } from '@/components/monitor-sells/section'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Home' }]
}

export default function Home() {
  return (
    <div className="grid grid-rows-2 gap-10">
      <MainSlogan />
      <MonitorSellsSection />
    </div>
  )
}
