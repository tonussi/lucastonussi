import { clampActionTunings, defaultActionTunings } from './character-actions.ts'
import { CHARACTER_MODEL_IDS, DEFAULT_CHARACTER_MODEL_ID, MODEL_CATALOG } from './model-catalog.ts'
import {
  ATTRIBUTE_LIMITS,
  ATTRIBUTES,
  DEFAULT_ATTRIBUTE_VALUE,
  DEFAULT_UNSPENT_POINTS,
  UNSPENT_POINTS_LIMITS,
} from './character-stats.ts'
import { QUICK_SLOT_CATEGORIES, QUICK_SLOT_LIMITS } from './quick-slots.ts'
import { clampIntegerRange, clampRange } from './seeded-random.ts'
import type { CharacterSettings, InventorySettings } from './types.ts'

export const AUTO_CLIP = ''

export const CHARACTER_STATES = [
  { state: 'idle', field: 'idleClip', label: 'Idle animation', pattern: /idle|stand|pose/i, fallbackIndex: 0, loop: true },
  { state: 'moving', field: 'movingClip', label: 'Moving animation', pattern: /run|jog|walk|move/i, fallbackIndex: 1, loop: true },
  { state: 'rolling', field: 'rollClip', label: 'Roll animation', pattern: /roll|dodge/i, fallbackState: 'moving', loop: false },
  { state: 'jumping', field: 'jumpClip', label: 'Jump animation', pattern: /jump.?start|jump(?!.?loop)/i, fallbackState: 'idle', loop: false },
  { state: 'falling', field: 'fallClip', label: 'Fall animation', pattern: /fall|jump.?loop/i, fallbackState: 'idle', loop: true },
] as const satisfies readonly CharacterStateDefinition[]

export type CharacterState = (typeof CHARACTER_STATES)[number]['state']
export type CharacterClipField = (typeof CHARACTER_STATES)[number]['field']

interface CharacterStateDefinition {
  state: string
  field: keyof CharacterSettings
  label: string
  pattern: RegExp
  fallbackIndex?: number
  fallbackState?: string
  loop: boolean
}

export interface CharacterMotion {
  rolling: boolean
  grounded: boolean
  verticalSpeed: number
  moving: boolean
}

export function characterStateFor({ rolling, grounded, verticalSpeed, moving }: CharacterMotion): CharacterState {
  if (rolling) return 'rolling'
  if (!grounded) return verticalSpeed > 0 ? 'jumping' : 'falling'
  return moving ? 'moving' : 'idle'
}

export const INVENTORY_LIMITS = {
  slots: { min: 1, max: 60 },
  tabs: { min: 1, max: 8 },
} as const
export const TAB_NAME_MAX_LENGTH = 24

export const CAMERA_ROTATION_SPEED_LIMITS = { min: 0.5, max: 10 } as const
export const DEFAULT_CAMERA_ROTATION_SPEED = 4.5
export const WALK_SPEED_LIMITS = { min: 1, max: 20 } as const
export const RUN_SPEED_LIMITS = { min: 2, max: 50 } as const
export const JUMP_HEIGHT_LIMITS = { min: 0.5, max: 40 } as const
export const DEFAULT_JUMP_HEIGHT = 12
export const ROLL_DURATION_LIMITS = { min: 0.15, max: 2 } as const
export const ROLL_DISTANCE_LIMITS = { min: 0.5, max: 30 } as const
export const DEFAULT_ROLL_DURATION = 0.45
export const DEFAULT_ROLL_DISTANCE = 5
export const DASH_HOLD_LIMITS = { min: 0.05, max: 1 } as const
export const DEFAULT_DASH_HOLD_SECONDS = 0.2
export const DEFAULT_EQUIPMENT = { sword: true, shield: true }
export const DEFAULT_WALK_SPEED = 6
export const DEFAULT_RUN_SPEED = 14

export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
  slots: 20,
  tabNames: ['Items'],
}

export const defaultTabName = (index: number) => `Tab ${index + 1}`

export function resizeInventoryTabs(tabNames: string[], count: number): string[] {
  const tabCount = clampIntegerRange(count, INVENTORY_LIMITS.tabs)
  return Array.from({ length: tabCount }, (_, index) => {
    const name = tabNames[index]?.slice(0, TAB_NAME_MAX_LENGTH)
    return name?.trim() ? name : defaultTabName(index)
  })
}

export function clampInventorySettings(settings: Partial<InventorySettings> = {}): InventorySettings {
  const tabNames = Array.isArray(settings.tabNames) ? settings.tabNames : DEFAULT_INVENTORY_SETTINGS.tabNames
  return {
    slots: clampIntegerRange(settings.slots ?? DEFAULT_INVENTORY_SETTINGS.slots, INVENTORY_LIMITS.slots),
    tabNames: resizeInventoryTabs(tabNames, tabNames.length),
  }
}

function clampAttributes(attributes: Record<string, number> = {}) {
  return Object.fromEntries(
    ATTRIBUTES.map(({ id }) => [
      id,
      clampIntegerRange(attributes[id] ?? DEFAULT_ATTRIBUTE_VALUE, ATTRIBUTE_LIMITS),
    ]),
  )
}

function clampLoadout(loadout: Record<string, string[]> = {}) {
  return Object.fromEntries(
    QUICK_SLOT_CATEGORIES.map(({ id }) => {
      const items = Array.isArray(loadout[id]) ? loadout[id] : []
      const names = items
        .map((name) => String(name).slice(0, QUICK_SLOT_LIMITS.nameLength))
        .filter((name) => name.trim())
      return [id, names.slice(0, QUICK_SLOT_LIMITS.items)]
    }),
  )
}

function clampClips(
  settings: Partial<Record<CharacterClipField, string>> = {},
  clips: string[] = [],
): Record<CharacterClipField, string> {
  return Object.fromEntries(
    CHARACTER_STATES.map(({ field }) => [field, clips.includes(settings[field] ?? '') ? settings[field] : AUTO_CLIP]),
  ) as Record<CharacterClipField, string>
}

export const DEFAULT_CHARACTER_SETTINGS: CharacterSettings = {
  inventory: DEFAULT_INVENTORY_SETTINGS,
  attributes: clampAttributes(),
  unspentPoints: DEFAULT_UNSPENT_POINTS,
  cameraRotationSpeed: DEFAULT_CAMERA_ROTATION_SPEED,
  walkSpeed: DEFAULT_WALK_SPEED,
  runSpeed: DEFAULT_RUN_SPEED,
  jumpHeight: DEFAULT_JUMP_HEIGHT,
  rollDuration: DEFAULT_ROLL_DURATION,
  rollDistance: DEFAULT_ROLL_DISTANCE,
  dashHoldSeconds: DEFAULT_DASH_HOLD_SECONDS,
  actions: defaultActionTunings(),
  equipment: { ...DEFAULT_EQUIPMENT },
  loadout: clampLoadout(),
  modelId: DEFAULT_CHARACTER_MODEL_ID,
  ...clampClips(),
}

export function clampCharacterSettings(settings: Partial<CharacterSettings> = {}): CharacterSettings {
  const modelId = CHARACTER_MODEL_IDS.includes(settings.modelId ?? '')
    ? (settings.modelId as string)
    : DEFAULT_CHARACTER_SETTINGS.modelId
  return {
    modelId,
    ...clampClips(settings, MODEL_CATALOG[modelId].clips),
    inventory: clampInventorySettings(settings.inventory),
    attributes: clampAttributes(settings.attributes),
    unspentPoints: clampIntegerRange(
      settings.unspentPoints ?? DEFAULT_UNSPENT_POINTS,
      UNSPENT_POINTS_LIMITS,
    ),
    cameraRotationSpeed: clampRange(
      settings.cameraRotationSpeed ?? DEFAULT_CAMERA_ROTATION_SPEED,
      CAMERA_ROTATION_SPEED_LIMITS,
    ),
    walkSpeed: clampRange(settings.walkSpeed ?? DEFAULT_WALK_SPEED, WALK_SPEED_LIMITS),
    runSpeed: clampRange(settings.runSpeed ?? DEFAULT_RUN_SPEED, RUN_SPEED_LIMITS),
    jumpHeight: clampRange(settings.jumpHeight ?? DEFAULT_JUMP_HEIGHT, JUMP_HEIGHT_LIMITS),
    rollDuration: clampRange(settings.rollDuration ?? DEFAULT_ROLL_DURATION, ROLL_DURATION_LIMITS),
    rollDistance: clampRange(settings.rollDistance ?? DEFAULT_ROLL_DISTANCE, ROLL_DISTANCE_LIMITS),
    dashHoldSeconds: clampRange(settings.dashHoldSeconds ?? DEFAULT_DASH_HOLD_SECONDS, DASH_HOLD_LIMITS),
    actions: clampActionTunings(settings.actions),
    equipment: {
      sword: settings.equipment?.sword ?? DEFAULT_EQUIPMENT.sword,
      shield: settings.equipment?.shield ?? DEFAULT_EQUIPMENT.shield,
    },
    loadout: clampLoadout(settings.loadout),
  }
}

export function resolveClipName(
  clipNames: string[],
  state: CharacterState,
  chosenClip = AUTO_CLIP,
  defaultClip = AUTO_CLIP,
): string | undefined {
  const preferred = [chosenClip, defaultClip].find((clip) => clip && clipNames.includes(clip))
  if (preferred) return preferred
  const definition: CharacterStateDefinition = CHARACTER_STATES.find((entry) => entry.state === state)!
  const matched = clipNames.find((name) => definition.pattern.test(name))
  if (matched) return matched
  if (definition.fallbackState) return resolveClipName(clipNames, definition.fallbackState as CharacterState)
  return clipNames[definition.fallbackIndex ?? 0] ?? clipNames[0]
}
