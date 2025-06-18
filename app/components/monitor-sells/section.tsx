import { MonitorSellsCard } from './card'
import { MonitorSellsDescription } from './description'

export function MonitorSellsSection() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <MonitorSellsDescription />
      <MonitorSellsCard />
    </div>
  )
}
