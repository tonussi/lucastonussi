import { MonitorSellsCard } from './card'
import { MonitorSellsDescription } from './description'

export function MonitorSellsSection() {
  return (
    <div className="grid xs:grid-rows-2 lg:grid-cols-2 content-center dark:bg-slate-800 bg-gray-50 p-30 gap-20">
      <MonitorSellsDescription />
      <div className="lg:w-1/2 xs:w-full justify-self-center">
        <MonitorSellsCard />
      </div>
    </div>
  )
}
