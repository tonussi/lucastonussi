import { DEFAULT_CHARACTER_SETTINGS } from './character-settings.ts'
import { MODEL_CATALOG } from './model-catalog.ts'
import { DEFAULT_GRASS_SETTINGS } from './grass-generator.ts'
import type { EngineSceneObject } from './types.ts'

export const BUILTIN_OBJECT_IDS = {
  ocean: 'builtin-ocean',
  ship: 'builtin-pirate-ship',
  character: 'builtin-character',
  redPlateGrass: 'builtin-grass-red-plate',
  bluePlateGrass: 'builtin-grass-blue-plate',
} as const

export const NON_DELETABLE_KINDS: EngineSceneObject['kind'][] = ['character']

const DEFAULT_OCEAN_LEVEL = -50.6
const DEFAULT_SHIP_POSITION: [number, number, number] = [0, -49.35, 0]
const DEFAULT_SHIP_SCALE = 6
const DEFAULT_CHARACTER_POSITION: [number, number, number] = [0, 0, 0]

export interface LegacyWorldSettings {
  oceanLevel?: number
  shipHeight?: number
  shipScale?: number
}

export function createBuiltinObjects(legacy: LegacyWorldSettings = {}): EngineSceneObject[] {
  const shipScale = legacy.shipScale ?? DEFAULT_SHIP_SCALE
  return [
    {
      id: BUILTIN_OBJECT_IDS.ocean,
      name: 'Ocean',
      kind: 'ocean',
      position: [0, legacy.oceanLevel ?? DEFAULT_OCEAN_LEVEL, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#064b70',
      visible: true,
      properties: {},
    },
    {
      id: BUILTIN_OBJECT_IDS.ship,
      name: MODEL_CATALOG['pirate-ship'].label,
      kind: 'model',
      position: [DEFAULT_SHIP_POSITION[0], legacy.shipHeight ?? DEFAULT_SHIP_POSITION[1], DEFAULT_SHIP_POSITION[2]],
      rotation: [0, 0, 0],
      scale: [shipScale, shipScale, shipScale],
      color: '#ffffff',
      visible: true,
      model: { modelId: 'pirate-ship', collider: MODEL_CATALOG['pirate-ship'].defaultCollider },
      properties: {},
    },
    {
      id: BUILTIN_OBJECT_IDS.character,
      name: 'Character',
      kind: 'character',
      character: DEFAULT_CHARACTER_SETTINGS,
      position: [...DEFAULT_CHARACTER_POSITION],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff',
      visible: true,
      properties: {},
    },
  ]
}

const PLATE_SIZE = 20
const PLATE_GRASS_BLADES = 6000
const PLATE_GRASS_HEIGHT = 0.45
const GRASS_COLOR = '#5fae3e'

const PLATES = [
  { id: BUILTIN_OBJECT_IDS.redPlateGrass, name: 'Red plate grass', position: [0, -10, 0], seed: 101 },
  { id: BUILTIN_OBJECT_IDS.bluePlateGrass, name: 'Blue plate grass', position: [-20, -20, 0], seed: 202 },
] as const

export function createGrassCoverObjects(): EngineSceneObject[] {
  return PLATES.map(({ id, name, position, seed }) => ({
    id,
    name,
    kind: 'grass',
    position: [...position],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: GRASS_COLOR,
    visible: true,
    grass: {
      ...DEFAULT_GRASS_SETTINGS,
      bladeCount: PLATE_GRASS_BLADES,
      height: PLATE_GRASS_HEIGHT,
      width: PLATE_SIZE,
      depth: PLATE_SIZE,
      seed,
    },
    properties: {},
  }))
}

export function createDefaultSceneObjects(): EngineSceneObject[] {
  return [...createBuiltinObjects(), ...createGrassCoverObjects()]
}
