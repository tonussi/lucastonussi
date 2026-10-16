import { useState } from 'react'
import DialogFrame from './dialog-frame'
import { ITEMS } from '../../game-engine/items'
import { QUICK_SLOT_CATEGORIES } from '../../game-engine/quick-slots'
import type { InventorySettings } from '../../game-engine/types'

interface InventoryDialogProps {
  settings: InventorySettings
  /** Quantity owned per item id. */
  owned: Record<string, number>
  onClose: () => void
}

const SLOT_COLUMNS = 5

export default function InventoryDialog({ settings, owned, onClose }: InventoryDialogProps) {
  const [activeTab, setActiveTab] = useState(0)
  const selectedTab = Math.min(activeTab, settings.tabNames.length - 1)
  const tabItems = ITEMS.filter(
    ({ id, category }) => (owned[id] ?? 0) > 0 && QUICK_SLOT_CATEGORIES.findIndex((entry) => entry.id === category) % settings.tabNames.length === selectedTab,
  )

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
            <div
              key={slot}
              title={tabItems[slot]?.label}
              className="flex aspect-square flex-col items-center justify-center rounded border border-white/15 bg-black/40 text-[10px]"
              style={tabItems[slot] ? { borderColor: tabItems[slot].color } : undefined}
            >
              {tabItems[slot] && (
                <>
                  <span className="truncate px-1">{tabItems[slot].label}</span>
                  <span className="text-white/70">×{owned[tabItems[slot].id]}</span>
                </>
              )}
            </div>
          ))}
        </div>
    </DialogFrame>
  )
}
