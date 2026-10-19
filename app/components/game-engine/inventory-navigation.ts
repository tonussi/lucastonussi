import type { ItemDefinition } from './items.ts'

export const INVENTORY_COLUMNS = 5
/** Items live in the first tab; later tabs stay empty until they get their own rules. */
export const ITEMS_TAB_INDEX = 0

export type NavigationDirection = 'up' | 'down' | 'left' | 'right'

export function wrapIndex(index: number, length: number) {
  return length <= 0 ? 0 : ((index % length) + length) % length
}

/** Moves a grid cursor one cell and keeps it inside the filled slots. */
export function moveSlot(index: number, direction: NavigationDirection, slotCount: number, columns = INVENTORY_COLUMNS) {
  if (slotCount <= 0) return 0
  const step = { up: -columns, down: columns, left: -1, right: 1 }[direction]
  const next = index + step
  return next < 0 || next >= slotCount ? Math.min(slotCount - 1, Math.max(0, index)) : next
}

export function itemsForTab(items: ItemDefinition[], owned: Record<string, number>, tab: number) {
  return tab === ITEMS_TAB_INDEX ? items.filter(({ id }) => (owned[id] ?? 0) > 0) : []
}
