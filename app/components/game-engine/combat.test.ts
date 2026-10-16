import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ACTION_COST_LIMITS,
  ACTION_DURATION_LIMITS,
  ACTIONS,
  actionProgress,
  advanceAction,
  clampActionTunings,
  IDLE_ACTION,
  startAction,
} from './character-actions.ts'
import { clampCharacterSettings, DEFAULT_CHARACTER_SETTINGS } from './character-settings.ts'
import { consumeSelectedItem, createRuntimeState, pickUpItem, quickSlotLabel, spendResource } from './character-runtime.ts'
import { HIT_POINTS_ID, RESOURCES, STAMINA_ID } from './character-stats.ts'
import { readDodgeInput } from './dodge-input.ts'
import { ITEMS, itemById } from './items.ts'
import { clampPickupSettings } from './pickup-settings.ts'
import { normalizeSceneObject } from './project-model.ts'
import { QUICK_SLOT_CATEGORIES } from './quick-slots.ts'
import { generateScenario } from './scenario-generator.ts'

test('action tunings are clamped per registry entry and keep the defaults', () => {
  const tunings = clampActionTunings({ attack: { duration: 1e6, cost: -5 }, bogus: { duration: 1, cost: 1 } })
  assert.equal(tunings.attack.duration, ACTION_DURATION_LIMITS.max)
  assert.equal(tunings.attack.cost, ACTION_COST_LIMITS.min)
  assert.deepEqual(Object.keys(tunings), ACTIONS.map(({ id }) => id))
  assert.equal(tunings.skill.cost, ACTIONS.find(({ id }) => id === 'skill')!.cost)
  assert.deepEqual(clampCharacterSettings({ actions: tunings }).actions, tunings)
})

test('actions start only when idle, progress to completion and return to idle', () => {
  const started = startAction(IDLE_ACTION, 'attack', 0.4)
  assert.equal(started.id, 'attack')
  assert.equal(startAction(started, 'skill', 1), started)
  const half = advanceAction(started, 0.2)
  assert.ok(Math.abs(actionProgress(half) - 0.5) < 1e-9)
  assert.equal(advanceAction(half, 0.3), IDLE_ACTION)
  assert.equal(actionProgress(IDLE_ACTION), 0)
})

test('the dodge button taps to dodge and holds to run', () => {
  const hold = 0.2
  assert.deepEqual(readDodgeInput(false, true, 0, 0.016, hold), { held: 0.016, tapped: false, dashing: false })
  assert.equal(readDodgeInput(true, false, 0.1, 0.016, hold).tapped, true)
  assert.equal(readDodgeInput(true, true, 0.19, 0.02, hold).dashing, true)
  assert.equal(readDodgeInput(true, false, 0.5, 0.016, hold).tapped, false)
})

test('the item registry only references known categories and resources', () => {
  const categories = QUICK_SLOT_CATEGORIES.map(({ id }) => id)
  const resources = RESOURCES.map(({ id }) => id)
  assert.ok(ITEMS.every(({ category }) => categories.includes(category)))
  assert.ok(ITEMS.every(({ effect }) => !effect || resources.includes(effect.resourceId)))
  assert.equal(new Set(ITEMS.map(({ id }) => id)).size, ITEMS.length)
})

test('spending resources fails without changing anything when there is not enough', () => {
  const state = createRuntimeState(DEFAULT_CHARACTER_SETTINGS)
  const spent = spendResource(state, STAMINA_ID, 10)!
  assert.equal(spent.resources[STAMINA_ID], state.resources[STAMINA_ID] - 10)
  assert.equal(spendResource(state, STAMINA_ID, 1e6), undefined)
  assert.equal(spendResource(state, STAMINA_ID, 0), state)
})

test('picking up items fills the inventory and quick slots once, and consumables restore resources', () => {
  let state = createRuntimeState(DEFAULT_CHARACTER_SETTINGS)
  assert.equal(consumeSelectedItem(state), undefined)
  state = pickUpItem(state, 'pickup-1', 'health-potion', 2)
  assert.equal(pickUpItem(state, 'pickup-1', 'health-potion', 2), state)
  assert.deepEqual(state.collected, ['pickup-1'])
  assert.equal(state.inventory['health-potion'], 2)
  assert.deepEqual(state.quickSlots.consumables, ['health-potion'])
  assert.equal(quickSlotLabel(state, 'consumables'), 'Health Potion ×2')
  assert.equal(pickUpItem(state, 'pickup-2', 'unknown', 1), state)

  const hurt = { ...state, resources: { ...state.resources, [HIT_POINTS_ID]: 10 } }
  const healed = consumeSelectedItem(hurt)!
  assert.equal(healed.resources[HIT_POINTS_ID], 10 + itemById('health-potion')!.effect!.amount)
  assert.equal(healed.inventory['health-potion'], 1)
  const empty = consumeSelectedItem(consumeSelectedItem(hurt)!)!
  assert.equal(consumeSelectedItem(empty), undefined)
})

test('pickups are clamped, saved with their object, and the scenario scatters them near the spawn', () => {
  assert.equal(clampPickupSettings({ itemId: 'nope', quantity: 1e6 }).itemId, ITEMS[0].id)
  assert.equal(clampPickupSettings({ quantity: 0 }).quantity, 1)
  const object = {
    id: 'p', name: 'Pickup', kind: 'pickup' as const, position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number],
    color: '#ffd166', visible: true, properties: {},
  }
  assert.ok(normalizeSceneObject(object).pickup)

  const pickups = generateScenario({ seed: 3, count: 10, radius: 100, pickupCount: 6 }).filter(({ kind }) => kind === 'pickup')
  assert.ok(pickups.length >= 3 && pickups.length <= 6)
  assert.ok(pickups.every(({ position }) => Math.hypot(position[0], position[2]) <= 10))
  assert.equal(generateScenario({ seed: 3, count: 10, radius: 100, pickupCount: 0 }).filter(({ kind }) => kind === 'pickup').length, 0)
})

test('equipment and dodge settings are clamped with defaults', () => {
  const settings = clampCharacterSettings({ dashHoldSeconds: 0, equipment: { sword: false } as never })
  assert.equal(settings.dashHoldSeconds, 0.05)
  assert.deepEqual(settings.equipment, { sword: false, shield: true })
})
