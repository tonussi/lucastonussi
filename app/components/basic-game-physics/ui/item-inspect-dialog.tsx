import { lazy, Suspense } from 'react'
import DialogFrame from './dialog-frame'
import type { ItemDefinition } from '../../game-engine/items'
import { itemEffectSummary } from '../../game-engine/items'

const ItemPreview = lazy(() => import('./item-preview'))

interface ItemInspectDialogProps {
  item: ItemDefinition
  quantity: number
  onClose: () => void
}

export default function ItemInspectDialog({ item, quantity, onClose }: ItemInspectDialogProps) {
  return (
    <DialogFrame label={`Inspect ${item.label}`} onClose={onClose}>
      <div className="h-64">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-xs text-white/60">Loading…</div>}>
          <ItemPreview color={item.color} />
        </Suspense>
      </div>
      <div className="border-t border-white/10 px-3 py-2 text-sm">
        <div className="flex justify-between"><span>{item.label}</span><span className="text-white/70">×{quantity}</span></div>
        <div className="text-xs text-white/60">{itemEffectSummary(item)}</div>
      </div>
    </DialogFrame>
  )
}
