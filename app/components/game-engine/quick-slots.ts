export type DpadDirection = 'up' | 'down' | 'left' | 'right'

export interface QuickSlotCategory {
  id: string
  label: string
  dpad: DpadDirection
}

export const QUICK_SLOT_CATEGORIES: QuickSlotCategory[] = [
  { id: 'spells', label: 'Spells', dpad: 'up' },
  { id: 'consumables', label: 'Consumables', dpad: 'down' },
  { id: 'primaryWeapons', label: 'Primary weapon', dpad: 'right' },
  { id: 'secondaryWeapons', label: 'Secondary weapon', dpad: 'left' },
]

export const QUICK_SLOT_LIMITS = { items: 16, nameLength: 32 } as const

export function nextIndex(current: number, length: number) {
  return length === 0 ? 0 : (current + 1) % length
}
