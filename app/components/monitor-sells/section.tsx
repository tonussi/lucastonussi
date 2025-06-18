import { MonitorSellsCard } from './card'
import { MonitorSellsDescription } from './description'

export function MonitorSellsSection() {
  return (
    <div className="grid grid-cols-2 gap-10 items-center justify-center">
      <MonitorSellsDescription />
      <MonitorSellsCard />
    </div>
  )
}
