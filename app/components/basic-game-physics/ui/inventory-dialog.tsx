import { useState } from 'react'
import DialogFrame from './dialog-frame'
import ItemInspectDialog from './item-inspect-dialog'
import { ITEMS } from '../../game-engine/items'
import { INVENTORY_COLUMNS, itemsForTab, moveSlot, wrapIndex } from '../../game-engine/inventory-navigation'
import type { InventorySettings } from '../../game-engine/types'
import type { GamepadState } from '../gamepad'
import { useButtonEdge } from '../use-button-edge'

interface InventoryDialogProps {
  settings: InventorySettings
  /** Quantity owned per item id. */
  owned: Record<string, number>
  gamepad: GamepadState
  /** Uses one owned item; returns false when it cannot be used. */
  onUseItem: (itemId: string) => boolean
  onClose: () => void
}

export default function InventoryDialog({ settings, owned, gamepad, onUseItem, onClose }: InventoryDialogProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [cursor, setCursor] = useState(0)
  const [inspecting, setInspecting] = useState(false)
  const tabCount = settings.tabNames.length
  const selectedTab = Math.min(activeTab, tabCount - 1)
  const tabItems = itemsForTab(ITEMS, owned, selectedTab)
  const slotCount = Math.min(settings.slots, tabItems.length)
  const cursorIndex = Math.min(cursor, Math.max(0, slotCount - 1))
  const current = tabItems[cursorIndex]

  const changeTab = (step: number) => {
    setActiveTab(wrapIndex(selectedTab + step, tabCount))
    setCursor(0)
  }
  const move = (direction: Parameters<typeof moveSlot>[1]) => setCursor(moveSlot(cursorIndex, direction, slotCount))
  const useCurrent = () => current && onUseItem(current.id)

  // While the inspect dialog is open it owns the gamepad: only X (toggle) is read here.
  const browsing = !inspecting
  useButtonEdge(browsing && (gamepad.lt || gamepad.lb), () => changeTab(-1))
  useButtonEdge(browsing && (gamepad.rt || gamepad.rb), () => changeTab(1))
  useButtonEdge(browsing && gamepad.dpadUp, () => move('up'))
  useButtonEdge(browsing && gamepad.dpadDown, () => move('down'))
  useButtonEdge(browsing && gamepad.dpadLeft, () => move('left'))
  useButtonEdge(browsing && gamepad.dpadRight, () => move('right'))
  useButtonEdge(browsing && gamepad.a, () => void useCurrent())
  useButtonEdge(gamepad.x, () => setInspecting((open) => (open ? false : Boolean(current))))
  useButtonEdge(inspecting && gamepad.b, () => setInspecting(false))

  return (
    <>
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
              onClick={() => { setActiveTab(index); setCursor(0) }}
            >
              {name}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          className="grid max-h-[60vh] gap-2 overflow-y-auto p-3"
          style={{ gridTemplateColumns: `repeat(${INVENTORY_COLUMNS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: settings.slots }, (_, slot) => {
            const item = tabItems[slot]
            const highlighted = slot === cursorIndex && Boolean(item)
            return (
              <div
                key={slot}
                title={item?.label}
                className={`flex aspect-square flex-col items-center justify-center rounded border bg-black/40 text-[10px] ${
                  highlighted ? 'border-2 border-amber-400 ring-2 ring-amber-400/40' : 'border-white/15'
                }`}
                style={item && !highlighted ? { borderColor: item.color } : undefined}
                onClick={() => item && setCursor(slot)}
              >
                {item && (
                  <>
                    <span className="truncate px-1">{item.label}</span>
                    <span className="text-white/70">×{owned[item.id]}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className="border-t border-white/10 px-3 py-2 text-[10px] text-white/50">
          LT/RT tabs · D-pad move · A use · X inspect
        </div>
    </DialogFrame>
    {inspecting && current && (
      <ItemInspectDialog item={current} quantity={owned[current.id] ?? 0} onClose={() => setInspecting(false)} />
    )}
    </>
  )
}
