export interface AttributeDefinition {
  id: string
  label: string
  description: string
}

export interface ScaledStatDefinition {
  id: string
  label: string
  base: number
  /** Value added per attribute point, keyed by attribute id. */
  scaling: Record<string, number>
}

export interface ResourceDefinition extends ScaledStatDefinition {
  color: string
  regenPerSecond: number
}

export const ATTRIBUTES: AttributeDefinition[] = [
  { id: 'strength', label: 'Strength', description: 'Raises attack power.' },
  { id: 'intelligence', label: 'Intelligence', description: 'Raises maximum mana.' },
  { id: 'vitality', label: 'Vitality', description: 'Raises maximum hit points.' },
  { id: 'energy', label: 'Energy', description: 'Raises maximum stamina and mana.' },
]

export const HIT_POINTS_ID = 'hitPoints'
export const MANA_ID = 'mana'
export const STAMINA_ID = 'stamina'

export const RESOURCES: ResourceDefinition[] = [
  { id: HIT_POINTS_ID, label: 'HP', color: '#d94b4b', base: 50, scaling: { vitality: 10 }, regenPerSecond: 0 },
  { id: MANA_ID, label: 'MP', color: '#4b7bd9', base: 20, scaling: { intelligence: 8, energy: 2 }, regenPerSecond: 1 },
  { id: STAMINA_ID, label: 'SP', color: '#5fbf5f', base: 40, scaling: { energy: 6, vitality: 2 }, regenPerSecond: 12 },
]

export const DERIVED_STATS: ScaledStatDefinition[] = [
  { id: 'attackPower', label: 'Attack power', base: 5, scaling: { strength: 2 } },
]

export const ATTRIBUTE_LIMITS = { min: 1, max: 99 } as const
export const UNSPENT_POINTS_LIMITS = { min: 0, max: 999 } as const
export const DEFAULT_ATTRIBUTE_VALUE = 10
export const DEFAULT_UNSPENT_POINTS = 5
export const SPRINT_STAMINA_DRAIN_PER_SECOND = 20

export function scaledStatValue(definition: ScaledStatDefinition, attributes: Record<string, number>) {
  return Object.entries(definition.scaling).reduce(
    (total, [attributeId, perPoint]) => total + (attributes[attributeId] ?? 0) * perPoint,
    definition.base,
  )
}
