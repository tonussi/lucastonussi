import { MonitorSellsSection } from '@/components/monitor-sells/section'
import { Slogan } from '@/components/slogan'
import { Vaper } from '@/components/vaper'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Home' }]
}

export default function Home() {
  return (
    <>
      <Vaper color="#25D366" particleCount={10} type="rounded" isActive={true} />
      <div className="grid xs:grid-rows-2 3xl:grid-cols-1 gap-30 fade-in-100 fade-out-100">
        <Slogan />
        <MonitorSellsSection />
      </div>
    </>
  )
}
