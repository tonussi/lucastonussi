import { Vaper } from '../vaper'
import { MonitorSellsCard } from './card'
import { MonitorSellsDescription } from './description'

export function MonitorSellsSection() {
  return (
    <div className="grid xs:grid-rows-2 lg:grid-cols-2 content-center bg-gradient-to-r from-blue-50 to-gray-100 p-30 gap-20">
      <MonitorSellsDescription />
      <div className="lg:w-3/4 lg:h-2/4 justify-self-center">
        <MonitorSellsCard />
        <Vaper color="gray" particleCount={10} type="rounded" isActive={true} />
      </div>
    </div>
  )
}
