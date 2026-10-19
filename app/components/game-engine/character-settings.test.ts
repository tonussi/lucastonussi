import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTO_CLIP,
  clampCharacterSettings,
  DEFAULT_CHARACTER_SETTINGS,
  resolveClipName,
} from './character-settings.ts'
import { MODEL_CATALOG } from './model-catalog.ts'
import { normalizeSceneObject } from './project-model.ts'
import { createBuiltinObjects } from './builtin-objects.ts'

const PIRATE_CLIPS = MODEL_CATALOG['skeleton-pirate'].clips

test('unknown models and clips fall back to the default model and automatic clips', () => {
  const clamped = clampCharacterSettings({ modelId: 'rabbit', idleClip: 'nope', movingClip: 'nope' })
  assert.deepEqual(clamped, DEFAULT_CHARACTER_SETTINGS)
})

test('clips are resolved by choice, then by name, then by position', () => {
  assert.equal(resolveClipName(PIRATE_CLIPS, 'idle'), PIRATE_CLIPS[0])
  assert.equal(resolveClipName(PIRATE_CLIPS, 'moving'), PIRATE_CLIPS[1])
  assert.equal(resolveClipName(PIRATE_CLIPS, 'idle', PIRATE_CLIPS[1]), PIRATE_CLIPS[1])
  assert.equal(resolveClipName(['Walk', 'Idle'], 'idle'), 'Idle')
  assert.equal(resolveClipName(['A', 'B'], 'moving'), 'B')
  assert.equal(resolveClipName(['Only'], 'moving', AUTO_CLIP), 'Only')
  assert.equal(resolveClipName([], 'idle'), undefined)
})

test('the built-in character carries settings and legacy characters receive defaults', () => {
  const character = createBuiltinObjects().find(({ kind }) => kind === 'character')!
  assert.deepEqual(character.character, DEFAULT_CHARACTER_SETTINGS)
  assert.deepEqual(normalizeSceneObject({ ...character, character: undefined }).character, DEFAULT_CHARACTER_SETTINGS)
})

import { clampInventorySettings, DEFAULT_INVENTORY_SETTINGS, INVENTORY_LIMITS, resizeInventoryTabs, TAB_NAME_MAX_LENGTH } from './character-settings.ts'

test('inventory slots and tabs are clamped and tabs always have names', () => {
  const clamped = clampInventorySettings({ slots: 1e6, tabNames: Array.from({ length: 50 }, () => 'x') })
  assert.equal(clamped.slots, INVENTORY_LIMITS.slots.max)
  assert.equal(clamped.tabNames.length, INVENTORY_LIMITS.tabs.max)
  assert.equal(clampInventorySettings({ slots: 0 }).slots, INVENTORY_LIMITS.slots.min)
  assert.deepEqual(clampInventorySettings({ tabNames: [] }).tabNames, ['Tab 1'])
  assert.deepEqual(clampInventorySettings(undefined), DEFAULT_INVENTORY_SETTINGS)
})

test('resizing tabs keeps existing names, names new tabs and limits name length', () => {
  assert.deepEqual(resizeInventoryTabs(['Bag', ' '], 3), ['Bag', 'Tab 2', 'Tab 3'])
  assert.deepEqual(resizeInventoryTabs(['Bag', 'Gear'], 1), ['Bag'])
  assert.equal(resizeInventoryTabs(['x'.repeat(100)], 1)[0].length, TAB_NAME_MAX_LENGTH)
})

import { createRuntimeState, spendAttributePoint, advanceResources, canSprint, cycleQuickSlot, resourceMaxima } from './character-runtime.ts'
import { ATTRIBUTE_LIMITS, ATTRIBUTES, STAMINA_ID } from './character-stats.ts'
import { QUICK_SLOT_CATEGORIES, QUICK_SLOT_LIMITS } from './quick-slots.ts'

test('attributes and loadout are clamped to the registries', () => {
  const clamped = clampCharacterSettings({
    attributes: { strength: 1e6, bogus: 5 } as never,
    unspentPoints: -3,
    loadout: { spells: ['Fire', '  ', 'x'.repeat(100)], bogus: ['a'] } as never,
  })
  assert.equal(clamped.attributes.strength, ATTRIBUTE_LIMITS.max)
  assert.deepEqual(Object.keys(clamped.attributes), ATTRIBUTES.map(({ id }) => id))
  assert.equal(clamped.unspentPoints, 0)
  assert.equal(clamped.loadout.spells.length, 2)
  assert.equal(clamped.loadout.spells[1].length, QUICK_SLOT_LIMITS.nameLength)
  assert.deepEqual(Object.keys(clamped.loadout), QUICK_SLOT_CATEGORIES.map(({ id }) => id))
})

test('spending points raises attributes and the maximum of resources they scale', () => {
  const state = createRuntimeState({ ...DEFAULT_CHARACTER_SETTINGS, unspentPoints: 1 })
  const spent = spendAttributePoint(state, 'vitality')
  assert.equal(spent.attributes.vitality, state.attributes.vitality + 1)
  assert.equal(spent.unspentPoints, 0)
  assert.ok(resourceMaxima(spent.attributes).hitPoints > resourceMaxima(state.attributes).hitPoints)
  assert.equal(spendAttributePoint(spent, 'vitality'), spent)
  assert.equal(spendAttributePoint(state, 'unknown'), state)
})

test('sprinting drains stamina to zero and blocks sprinting until it regenerates', () => {
  const full = createRuntimeState(DEFAULT_CHARACTER_SETTINGS)
  const drained = advanceResources(full, 1000, true)
  assert.equal(drained.resources[STAMINA_ID], 0)
  assert.equal(canSprint(drained), false)
  const recovered = advanceResources(drained, 1, false)
  assert.ok(canSprint(recovered))
  assert.equal(advanceResources(full, 1000, false).resources[STAMINA_ID], full.resources[STAMINA_ID])
})

test('quick slots cycle through the loadout and wrap around', () => {
  let state = createRuntimeState(DEFAULT_CHARACTER_SETTINGS)
  state = cycleQuickSlot(state, 'spells', 2)
  assert.equal(state.selectedItems.spells, 1)
  state = cycleQuickSlot(state, 'spells', 2)
  assert.equal(state.selectedItems.spells, 0)
  assert.equal(cycleQuickSlot(state, 'spells', 0).selectedItems.spells, 0)
})

test('catalog default clips beat name matching, which could pick a pose clip', () => {
  const clips = ['A_TPose', 'Idle_Loop', 'Jog_Fwd_Loop']
  assert.equal(resolveClipName(clips, 'idle', AUTO_CLIP, 'Idle_Loop'), 'Idle_Loop')
  assert.equal(resolveClipName(clips, 'idle', 'Jog_Fwd_Loop', 'Idle_Loop'), 'Jog_Fwd_Loop')
  assert.equal(resolveClipName(clips, 'moving', AUTO_CLIP, 'Missing'), 'Jog_Fwd_Loop')
})

test('every catalog default clip exists in the model clip list', () => {
  Object.values(MODEL_CATALOG).forEach(({ clips, defaultClips }) => {
    Object.values(defaultClips ?? {}).forEach((clip) => assert.ok(clips.includes(clip)))
  })
})

import { CAMERA_ROTATION_SPEED_LIMITS, DEFAULT_CAMERA_ROTATION_SPEED } from './character-settings.ts'

test('camera rotation speed is clamped and defaults for older characters', () => {
  assert.equal(clampCharacterSettings({ cameraRotationSpeed: 1e6 }).cameraRotationSpeed, CAMERA_ROTATION_SPEED_LIMITS.max)
  assert.equal(clampCharacterSettings({ cameraRotationSpeed: -1 }).cameraRotationSpeed, CAMERA_ROTATION_SPEED_LIMITS.min)
  assert.equal(clampCharacterSettings({}).cameraRotationSpeed, DEFAULT_CAMERA_ROTATION_SPEED)
})

import { characterStateFor } from './character-settings.ts'

test('character state follows rolling, then air movement, then ground movement', () => {
  const ground = { rolling: false, grounded: true, verticalSpeed: 0, moving: false }
  assert.equal(characterStateFor(ground), 'idle')
  assert.equal(characterStateFor({ ...ground, moving: true }), 'moving')
  assert.equal(characterStateFor({ ...ground, rolling: true, moving: true }), 'rolling')
  assert.equal(characterStateFor({ ...ground, grounded: false, verticalSpeed: 5 }), 'jumping')
  assert.equal(characterStateFor({ ...ground, grounded: false, verticalSpeed: -1 }), 'falling')
})

test('roll, jump and fall clips resolve by name and fall back to ground clips', () => {
  const clips = ['Idle_Loop', 'Jog_Fwd_Loop', 'Roll', 'Jump_Start', 'Jump_Loop']
  assert.equal(resolveClipName(clips, 'rolling'), 'Roll')
  assert.equal(resolveClipName(clips, 'jumping'), 'Jump_Start')
  assert.equal(resolveClipName(clips, 'falling'), 'Jump_Loop')
  assert.equal(resolveClipName(PIRATE_CLIPS, 'rolling'), PIRATE_CLIPS[1])
  assert.equal(resolveClipName(PIRATE_CLIPS, 'jumping'), PIRATE_CLIPS[0])
})

import { DEFAULT_RUN_SPEED, DEFAULT_WALK_SPEED, RUN_SPEED_LIMITS, WALK_SPEED_LIMITS } from './character-settings.ts'

test('walk and run speeds are clamped, default faster than before and kept by saved characters', () => {
  assert.ok(DEFAULT_WALK_SPEED > 2)
  assert.equal(clampCharacterSettings({ walkSpeed: 1e6 }).walkSpeed, WALK_SPEED_LIMITS.max)
  assert.equal(clampCharacterSettings({ runSpeed: -5 }).runSpeed, RUN_SPEED_LIMITS.min)
  assert.deepEqual(
    [clampCharacterSettings({}).walkSpeed, clampCharacterSettings({}).runSpeed],
    [DEFAULT_WALK_SPEED, DEFAULT_RUN_SPEED],
  )
  assert.equal(clampCharacterSettings({ walkSpeed: 9 }).walkSpeed, 9)
})

import { DEFAULT_JUMP_HEIGHT, JUMP_HEIGHT_LIMITS } from './character-settings.ts'
import { jumpVelocity } from './jump.ts'

test('jump height is clamped and converts to the launch speed that reaches it', () => {
  assert.equal(clampCharacterSettings({ jumpHeight: 1e6 }).jumpHeight, JUMP_HEIGHT_LIMITS.max)
  assert.equal(clampCharacterSettings({ jumpHeight: -1 }).jumpHeight, JUMP_HEIGHT_LIMITS.min)
  assert.equal(clampCharacterSettings({}).jumpHeight, DEFAULT_JUMP_HEIGHT)
  const gravity = -9.8
  const scale = 2.5
  const velocity = jumpVelocity(6, gravity, scale)
  assert.ok(Math.abs((velocity * velocity) / (2 * Math.abs(gravity) * scale) - 6) < 1e-9)
  assert.ok(jumpVelocity(8, gravity, scale) > jumpVelocity(2, gravity, scale))
})

import { DEFAULT_ROLL_DURATION, ROLL_DURATION_LIMITS, ROLL_DISTANCE_LIMITS } from './character-settings.ts'

test('roll duration and speed are clamped, and the default roll is short', () => {
  assert.ok(DEFAULT_ROLL_DURATION < 0.8)
  assert.equal(clampCharacterSettings({ rollDuration: 1e6 }).rollDuration, ROLL_DURATION_LIMITS.max)
  assert.equal(clampCharacterSettings({ rollDuration: 0 }).rollDuration, ROLL_DURATION_LIMITS.min)
  assert.equal(clampCharacterSettings({ rollDistance: 1e6 }).rollDistance, ROLL_DISTANCE_LIMITS.max)
  assert.equal(clampCharacterSettings({}).rollDuration, DEFAULT_ROLL_DURATION)
})

import { rollFadeSeconds, rollSpeedFor } from './roll.ts'

test('roll speed covers the configured distance in the configured time and the fade stays short', () => {
  assert.equal(rollSpeedFor(6, 0.5) * 0.5, 6)
  assert.ok(rollSpeedFor(10, 0.3) > rollSpeedFor(10, 0.6))
  assert.ok(Math.abs(rollFadeSeconds(0.5, 0.45) - 0.045) < 1e-9)
  assert.equal(rollFadeSeconds(0.05, 2), 0.05)
})
import { MOTION_SETTINGS } from './character-settings.ts'

test('motion tunings normalize old characters and clamp persisted values', () => {
  const defaults = clampCharacterSettings()
  for (const key of Object.keys(MOTION_SETTINGS) as (keyof typeof MOTION_SETTINGS)[]) {
    assert.equal(defaults[key], MOTION_SETTINGS[key].default)
    assert.equal(clampCharacterSettings({ [key]: -100 })[key], MOTION_SETTINGS[key].min)
    assert.equal(clampCharacterSettings({ [key]: 100 })[key], MOTION_SETTINGS[key].max)
  }
  assert.equal(resolveClipName(['Idle_Loop', 'PickUp_Table'], 'interacting'), 'PickUp_Table')
})
