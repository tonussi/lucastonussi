import type { ActionId } from '../game-engine/character-actions'

/** Mutable frame-to-frame state shared by the controller (writer) and the equipment/effects (readers). */
export interface CombatVisual {
  action: ActionId | null
  progress: number
  guarding: boolean
  /** Incremented every time the skill is cast so effects can restart. */
  skillSerial: number
}

export const createCombatVisual = (): CombatVisual => ({ action: null, progress: 0, guarding: false, skillSerial: 0 })
