import { MainSlogan } from '@/components/main-slogan'
import { MonitorSellsCard } from '@/components/monitor-sells/card'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Home' }]
}

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <MainSlogan />
      <MonitorSellsCard />
    </div>
  )
}
