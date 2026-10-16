import {
  ATTRIBUTE_LIMITS,
  RESOURCES,
  scaledStatValue,
  SPRINT_STAMINA_DRAIN_PER_SECOND,
  STAMINA_ID,
} from './character-stats.ts'
import { itemById, itemLabel } from './items.ts'
import { nextIndex, QUICK_SLOT_CATEGORIES } from './quick-slots.ts'
import type { CharacterSettings } from './types.ts'

export interface CharacterRuntimeState {
  attributes: Record<string, number>
  unspentPoints: number
  resources: Record<string, number>
  selectedItems: Record<string, number>
  /** Item ids or raw names shown in each quick-slot category. */
  quickSlots: Record<string, string[]>
  /** Quantity owned per item id. */
  inventory: Record<string, number>
  /** Ids of pickups already taken from the world this session. */
  collected: string[]
}

export function resourceMaxima(attributes: Record<string, number>) {
  return Object.fromEntries(RESOURCES.map((resource) => [resource.id, scaledStatValue(resource, attributes)]))
}

export function createRuntimeState({ attributes, unspentPoints, loadout }: CharacterSettings): CharacterRuntimeState {
  return {
    quickSlots: Object.fromEntries(QUICK_SLOT_CATEGORIES.map(({ id }) => [id, [...(loadout[id] ?? [])]])),
    inventory: {},
    collected: [],
    attributes: { ...attributes },
    unspentPoints,
    resources: resourceMaxima(attributes),
    selectedItems: Object.fromEntries(QUICK_SLOT_CATEGORIES.map(({ id }) => [id, 0])),
  }
}

export function spendAttributePoint(state: CharacterRuntimeState, attributeId: string): CharacterRuntimeState {
  const value = state.attributes[attributeId]
  if (value === undefined || value >= ATTRIBUTE_LIMITS.max || state.unspentPoints <= 0) return state
  return {
    ...state,
    attributes: { ...state.attributes, [attributeId]: value + 1 },
    unspentPoints: state.unspentPoints - 1,
  }
}

export function canSprint(state: CharacterRuntimeState) {
  return (state.resources[STAMINA_ID] ?? 0) > 0
}

export function advanceResources(
  state: CharacterRuntimeState,
  deltaSeconds: number,
  sprinting: boolean,
): CharacterRuntimeState {
  const maxima = resourceMaxima(state.attributes)
  const resources = Object.fromEntries(
    RESOURCES.map(({ id, regenPerSecond }) => {
      const rate = id === STAMINA_ID && sprinting ? -SPRINT_STAMINA_DRAIN_PER_SECOND : regenPerSecond
      return [id, Math.min(maxima[id], Math.max(0, state.resources[id] + rate * deltaSeconds))]
    }),
  )
  return { ...state, resources }
}

export function cycleQuickSlot(
  state: CharacterRuntimeState,
  categoryId: string,
  itemCount: number,
): CharacterRuntimeState {
  return {
    ...state,
    selectedItems: {
      ...state.selectedItems,
      [categoryId]: nextIndex(state.selectedItems[categoryId] ?? 0, itemCount),
    },
  }
}

export function spendResource(
  state: CharacterRuntimeState,
  resourceId: string,
  amount: number,
): CharacterRuntimeState | undefined {
  const current = state.resources[resourceId] ?? 0
  if (amount <= 0) return state
  if (current < amount) return undefined
  return { ...state, resources: { ...state.resources, [resourceId]: current - amount } }
}

export function pickUpItem(
  state: CharacterRuntimeState,
  pickupId: string,
  itemId: string,
  quantity: number,
): CharacterRuntimeState {
  const item = itemById(itemId)
  if (!item || state.collected.includes(pickupId)) return state
  const slots = state.quickSlots[item.category] ?? []
  const known = slots.includes(item.id) || slots.includes(item.label)
  return {
    ...state,
    collected: [...state.collected, pickupId],
    inventory: { ...state.inventory, [item.id]: (state.inventory[item.id] ?? 0) + quantity },
    quickSlots: { ...state.quickSlots, [item.category]: known ? slots : [...slots, item.id] },
  }
}

export const quickSlotLabel = (state: CharacterRuntimeState, categoryId: string) => {
  const slot = state.quickSlots[categoryId]?.[state.selectedItems[categoryId] ?? 0]
  if (!slot) return undefined
  const quantity = state.inventory[slot]
  return quantity !== undefined ? `${itemLabel(slot)} ×${quantity}` : itemLabel(slot)
}

/** Consumes the selected consumable and restores its resource; returns undefined when nothing can be used. */
export function consumeSelectedItem(state: CharacterRuntimeState): CharacterRuntimeState | undefined {
  const slot = state.quickSlots.consumables?.[state.selectedItems.consumables ?? 0]
  const item = itemById(slot ?? '')
  const owned = state.inventory[item?.id ?? ''] ?? 0
  if (!item?.effect || owned <= 0) return undefined
  const maxima = resourceMaxima(state.attributes)
  const { resourceId, amount } = item.effect
  return {
    ...state,
    inventory: { ...state.inventory, [item.id]: owned - 1 },
    resources: { ...state.resources, [resourceId]: Math.min(maxima[resourceId], (state.resources[resourceId] ?? 0) + amount) },
  }
}
