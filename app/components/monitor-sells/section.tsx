import { MonitorSellsCard } from './card'
import { MonitorSellsDescription } from './description'

export function MonitorSellsSection() {
  return (
    <div className="grid grid-cols-2 content-center bg-gray-50 p-30">
      <MonitorSellsDescription />
      <div className="w-1/2 justify-self-center">
        <MonitorSellsCard />
      </div>
    </div>
  )
}
