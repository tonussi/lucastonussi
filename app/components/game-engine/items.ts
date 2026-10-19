import { HIT_POINTS_ID, MANA_ID, RESOURCES, STAMINA_ID } from './character-stats.ts'

export interface ItemEffect {
  resourceId: string
  amount: number
}

export interface ItemDefinition {
  id: string
  label: string
  /** Quick-slot category id from the quick-slots registry. */
  category: string
  color: string
  /** Restored when a consumable is used. */
  effect?: ItemEffect
}

export const ITEMS: ItemDefinition[] = [
  { id: 'healing-herb', label: 'Healing Herb', category: 'consumables', color: '#8fbe58', effect: { resourceId: HIT_POINTS_ID, amount: 18 } },
  { id: 'blue-juniper', label: 'Blue Juniper', category: 'consumables', color: '#71a9a1', effect: { resourceId: MANA_ID, amount: 14 } },
  { id: 'mountain-root', label: 'Mountain Root', category: 'consumables', color: '#b89562', effect: { resourceId: STAMINA_ID, amount: 22 } },
  { id: 'health-potion', label: 'Health Potion', category: 'consumables', color: '#d94b4b', effect: { resourceId: HIT_POINTS_ID, amount: 40 } },
  { id: 'mana-potion', label: 'Mana Potion', category: 'consumables', color: '#4b7bd9', effect: { resourceId: MANA_ID, amount: 30 } },
  { id: 'stamina-tonic', label: 'Stamina Tonic', category: 'consumables', color: '#5fbf5f', effect: { resourceId: STAMINA_ID, amount: 50 } },
  { id: 'iron-sword', label: 'Iron Sword', category: 'primaryWeapons', color: '#c9ced6' },
  { id: 'wooden-shield', label: 'Wooden Shield', category: 'secondaryWeapons', color: '#a87a4a' },
  { id: 'fire-bolt', label: 'Fire Bolt', category: 'spells', color: '#ff8a3d' },
]

export const PICKUP_QUANTITY_LIMITS = { min: 1, max: 99 } as const

export const itemById = (id: string) => ITEMS.find((item) => item.id === id)

export const itemLabel = (id: string) => itemById(id)?.label ?? id

export const itemEffectSummary = (item: ItemDefinition) =>
  item.effect ? `Restores ${item.effect.amount} ${RESOURCES.find(({ id }) => id === item.effect?.resourceId)?.label ?? item.effect.resourceId}` : 'Equipment'
