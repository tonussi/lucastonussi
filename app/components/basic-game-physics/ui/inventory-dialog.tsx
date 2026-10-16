import { useState } from 'react'
import DialogFrame from './dialog-frame'
import type { InventorySettings } from '../../game-engine/types'

interface InventoryDialogProps {
  settings: InventorySettings
  onClose: () => void
}

const SLOT_COLUMNS = 5

export default function InventoryDialog({ settings, onClose }: InventoryDialogProps) {
  const [activeTab, setActiveTab] = useState(0)
  const selectedTab = Math.min(activeTab, settings.tabNames.length - 1)

  return (
    <DialogFrame label="Inventory" onClose={onClose}>
        <div role="tablist" className="flex overflow-x-auto border-b border-white/10">
          {settings.tabNames.map((name, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selectedTab}
              className={`px-3 py-2 text-sm whitespace-nowrap ${
                index === selectedTab ? 'border-b-2 border-amber-400 text-white' : 'text-white/60'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {name}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          className="grid max-h-[60vh] gap-2 overflow-y-auto p-3"
          style={{ gridTemplateColumns: `repeat(${SLOT_COLUMNS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: settings.slots }, (_, slot) => (
            <div key={slot} className="aspect-square rounded border border-white/15 bg-black/40" />
          ))}
        </div>
    </DialogFrame>
  )
}
