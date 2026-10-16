import { ITEMS, PICKUP_QUANTITY_LIMITS } from './items.ts'
import { clampIntegerRange } from './seeded-random.ts'
import type { PickupSettings } from './types.ts'

export const DEFAULT_PICKUP_SETTINGS: PickupSettings = { itemId: ITEMS[0].id, quantity: 1 }

export function clampPickupSettings(settings: Partial<PickupSettings> = {}): PickupSettings {
  const itemId = ITEMS.some(({ id }) => id === settings.itemId) ? (settings.itemId as string) : DEFAULT_PICKUP_SETTINGS.itemId
  return { itemId, quantity: clampIntegerRange(settings.quantity ?? DEFAULT_PICKUP_SETTINGS.quantity, PICKUP_QUANTITY_LIMITS) }
}
