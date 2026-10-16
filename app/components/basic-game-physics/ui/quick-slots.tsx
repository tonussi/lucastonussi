import { quickSlotLabel, type CharacterRuntimeState } from '../../game-engine/character-runtime'
import { QUICK_SLOT_CATEGORIES, type DpadDirection } from '../../game-engine/quick-slots'

interface QuickSlotsProps {
  state: CharacterRuntimeState
}

const CROSS_POSITION: Record<DpadDirection, string> = {
  up: 'col-start-2 row-start-1',
  left: 'col-start-1 row-start-2',
  right: 'col-start-3 row-start-2',
  down: 'col-start-2 row-start-3',
}
const EMPTY_SLOT_LABEL = '—'

export default function QuickSlots({ state }: QuickSlotsProps) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-40 grid grid-cols-3 grid-rows-3 gap-1">
      {QUICK_SLOT_CATEGORIES.map(({ id, label, dpad }) => {
        return (
          <div
            key={id}
            title={label}
            className={`${CROSS_POSITION[dpad]} flex h-14 w-20 flex-col items-center justify-center rounded border border-white/25 bg-black/60 px-1 text-center text-white`}
          >
            <span className="text-[8px] text-white/50">{label}</span>
            <span className="truncate text-[10px]">{quickSlotLabel(state, id) ?? EMPTY_SLOT_LABEL}</span>
          </div>
        )
      })}
    </div>
  )
}
