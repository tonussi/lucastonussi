import {
  ATTRIBUTE_LIMITS,
  RESOURCES,
  scaledStatValue,
  SPRINT_STAMINA_DRAIN_PER_SECOND,
  STAMINA_ID,
} from './character-stats.ts'
import { nextIndex, QUICK_SLOT_CATEGORIES } from './quick-slots.ts'
import type { CharacterSettings } from './types.ts'

export interface CharacterRuntimeState {
  attributes: Record<string, number>
  unspentPoints: number
  resources: Record<string, number>
  selectedItems: Record<string, number>
}

export function resourceMaxima(attributes: Record<string, number>) {
  return Object.fromEntries(RESOURCES.map((resource) => [resource.id, scaledStatValue(resource, attributes)]))
}

export function createRuntimeState({ attributes, unspentPoints }: CharacterSettings): CharacterRuntimeState {
  return {
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
