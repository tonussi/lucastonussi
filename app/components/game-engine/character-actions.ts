import { MANA_ID, STAMINA_ID } from './character-stats.ts'
import { clampRange } from './seeded-random.ts'

export type ActionId = 'attack' | 'strongAttack' | 'skill' | 'useItem' | 'interact'

export interface ActionDefinition {
  id: ActionId
  label: string
  /** Default length in seconds. */
  duration: number
  resourceId: string | null
  /** Default resource spent when the action starts. */
  cost: number
}

export const ACTIONS: ActionDefinition[] = [
  { id: 'attack', label: 'Attack', duration: 0.4, resourceId: STAMINA_ID, cost: 10 },
  { id: 'strongAttack', label: 'Strong attack', duration: 0.8, resourceId: STAMINA_ID, cost: 25 },
  { id: 'skill', label: 'Skill', duration: 0.7, resourceId: MANA_ID, cost: 15 },
  { id: 'useItem', label: 'Use item', duration: 0.5, resourceId: null, cost: 0 },
  { id: 'interact', label: 'Interact', duration: 0.35, resourceId: null, cost: 0 },
]

export const ACTION_DURATION_LIMITS = { min: 0.1, max: 3 } as const
export const ACTION_COST_LIMITS = { min: 0, max: 200 } as const

export interface ActionTuning {
  duration: number
  cost: number
}

export const GUARD_STAMINA_DRAIN_PER_SECOND = 8
export const GUARD_SPEED_RATIO = 0.5
export const INTERACT_RANGE = 3

export function defaultActionTunings(): Record<string, ActionTuning> {
  return Object.fromEntries(ACTIONS.map(({ id, duration, cost }) => [id, { duration, cost }]))
}

export function clampActionTunings(tunings: Record<string, Partial<ActionTuning>> = {}): Record<string, ActionTuning> {
  return Object.fromEntries(
    ACTIONS.map(({ id, duration, cost }) => [
      id,
      {
        duration: clampRange(tunings[id]?.duration ?? duration, ACTION_DURATION_LIMITS),
        cost: clampRange(tunings[id]?.cost ?? cost, ACTION_COST_LIMITS),
      },
    ]),
  )
}

export interface ActionState {
  id: ActionId | null
  elapsed: number
  duration: number
}

export const IDLE_ACTION: ActionState = { id: null, elapsed: 0, duration: 0 }

export function startAction(state: ActionState, id: ActionId, duration: number): ActionState {
  return state.id === null ? { id, elapsed: 0, duration } : state
}

export function advanceAction(state: ActionState, deltaSeconds: number): ActionState {
  if (state.id === null) return state
  const elapsed = state.elapsed + deltaSeconds
  return elapsed >= state.duration ? IDLE_ACTION : { ...state, elapsed }
}

export const actionProgress = (state: ActionState) =>
  state.id === null || state.duration === 0 ? 0 : Math.min(1, state.elapsed / state.duration)
