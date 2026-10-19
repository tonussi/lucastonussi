import {
  DEFAULT_BACKGROUND_COLOR,
  defaultEngineProject,
  type EngineProject,
  type EngineSceneObject,
  type JsonObject,
  type JsonValue,
} from './types.ts'
import { createBuiltinObjects, createGrassCoverObjects, type LegacyWorldSettings } from './builtin-objects.ts'
import { MODEL_CATALOG, MODEL_COLLIDERS } from './model-catalog.ts'
import { clampCaveSettings } from './cave-generator.ts'
import { clampGrassSettings } from './grass-generator.ts'
import { clampGrassPlaneSettings } from './grass-plane-generator.ts'
import { clampHouseSettings } from './house-layout.ts'
import { clampLightSettings } from './light-settings.ts'
import { clampMountainSettings } from './mountain-generator.ts'
import { clampCharacterSettings } from './character-settings.ts'
import { clampPickupSettings } from './pickup-settings.ts'
import { clampPathSettings } from './path-generator.ts'
import { clampWaterSettings } from './water-generator.ts'
import { clampRockSettings } from './rock-generator.ts'
import { clampProceduralSettings } from './scenario-generator.ts'
import { clampOceanSettings } from './ocean-generator.ts'
import { clampTreeSettings } from './tree-generator.ts'
import { broadenHorizonMountain } from './horizon-profile.ts'

export const ENGINE_PROJECT_STORAGE_KEY = 'lucastonussi:experimental-engine:v1'

export type EngineProjectInput = Omit<Partial<EngineProject>, 'schemaVersion' | 'world'> & {
  schemaVersion?: 1 | 2 | 3 | 4 | 5
  world?: Partial<EngineProject['world']> & LegacyWorldSettings
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isJsonValue)
  if (typeof value !== 'object') return false
  return Object.values(value).every(isJsonValue)
}

export function parseJsonValue(source: string): JsonValue {
  const value: unknown = JSON.parse(source)
  if (!isJsonValue(value)) throw new Error('Value must be valid JSON data')
  return value
}

function normalizeModelSettings(settings: EngineSceneObject['model']) {
  const modelId = settings?.modelId ?? ''
  const fallbackCollider = MODEL_CATALOG[modelId]?.defaultCollider ?? 'none'
  const collider =
    settings?.collider && MODEL_COLLIDERS.includes(settings.collider) ? settings.collider : fallbackCollider
  return { modelId, collider }
}

const KIND_SETTINGS_NORMALIZERS: Partial<
  Record<EngineSceneObject['kind'], (object: EngineSceneObject) => Partial<EngineSceneObject>>
> = {
  tree: (object) => ({ tree: clampTreeSettings(object.tree) }),
  light: (object) => ({ light: clampLightSettings(object.light) }),
  model: (object) => ({ model: normalizeModelSettings(object.model) }),
  grass: (object) => ({ grass: clampGrassSettings(object.grass) }),
  cave: (object) => ({ cave: clampCaveSettings(object.cave) }),
  house: (object) => ({ house: clampHouseSettings(object.house) }),
  'grass-plane': (object) => ({ grassPlane: clampGrassPlaneSettings(object.grassPlane) }),
  mountain: (object) => ({ mountain: clampMountainSettings(object.mountain) }),
  character: (object) => ({ character: clampCharacterSettings(object.character) }),
  rock: (object) => ({ rock: clampRockSettings(object.rock) }),
  pickup: (object) => ({ pickup: clampPickupSettings(object.pickup) }),
  water: (object) => ({ water: clampWaterSettings(object.water) }),
  path: (object) => ({ path: clampPathSettings(object.path) }),
  ocean: (object) => ({ ocean: clampOceanSettings(object.ocean) }),
}

export function normalizeSceneObject(object: EngineSceneObject): EngineSceneObject {
  object = broadenHorizonMountain(object)
  return {
    ...object,
    ...KIND_SETTINGS_NORMALIZERS[object.kind]?.(object),
    position: [...object.position],
    rotation: [...object.rotation],
    scale: [...object.scale],
    properties:
      object.properties && isJsonValue(object.properties) ? (object.properties as JsonObject) : {},
  }
}

function migrateLegacySceneObjects(input: EngineProjectInput): EngineSceneObject[] {
  const sceneObjects = Array.isArray(input.sceneObjects) ? input.sceneObjects : []
  const version = input.schemaVersion ?? 1
  return [
    ...(version < 2 ? createBuiltinObjects(input.world) : []),
    ...(version < 3 ? createGrassCoverObjects() : []),
    ...sceneObjects,
  ]
}

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function normalizeHexColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value) ? value.toLowerCase() : fallback
}

export function normalizeProject(input: EngineProjectInput): EngineProject {
  return {
    ...defaultEngineProject,
    ...input,
    world: {
      fogNear: input.world?.fogNear ?? defaultEngineProject.world.fogNear,
      fogFar: input.world?.fogFar ?? defaultEngineProject.world.fogFar,
      backgroundColor: normalizeHexColor(input.world?.backgroundColor, DEFAULT_BACKGROUND_COLOR),
    },
    procedural: clampProceduralSettings({ ...defaultEngineProject.procedural, ...input.procedural,
      ...((input.schemaVersion ?? 1) < 5 && { groundGrassCount: Math.min(20000, (input.procedural?.groundGrassCount ?? 3600) * 4) }),
    }),
    debug: { ...defaultEngineProject.debug, ...input.debug },
    schemaVersion: 5,
    sceneObjects: migrateLegacySceneObjects(input)
      .filter(object => !(object.kind === 'path' && object.properties?.generated === 'scenario'))
      .map(object => {
        if ((input.schemaVersion ?? 1) < 4) {
          if (object.kind === 'character') object = { ...object, character: { ...clampCharacterSettings(object.character), equipment: { sword: false, shield: false } } }
          if (object.kind === 'tree' && object.properties?.biome === 'nepal-highland-forest') {
            const tree = clampTreeSettings(object.tree)
            object = { ...object, tree: { ...tree, leafSize: tree.height >= 7 ? 0.7 : 0.55 } }
          }
          if (object.kind === 'grass-plane' && object.properties?.generated === 'scenario') object = { ...object, grassPlane: { ...clampGrassPlaneSettings(object.grassPlane), bladeCount: 3600, bladeHeight: 0.22 } }
        }
        if ((input.schemaVersion ?? 1) < 5 && object.kind === 'grass-plane' && object.properties?.generated === 'scenario') {
          const grassPlane = clampGrassPlaneSettings(object.grassPlane)
          object = { ...object, grassPlane: { ...grassPlane, bladeCount: Math.min(20000, grassPlane.bladeCount * 4) } }
        }
        return normalizeSceneObject(object)
      }),
    flow: input.flow ?? defaultEngineProject.flow,
    generations: input.generations ?? [],
  }
}

export function updateSceneObject(
  project: EngineProject,
  id: string,
  patch: Partial<EngineSceneObject>,
): EngineProject {
  return {
    ...project,
    sceneObjects: project.sceneObjects.map((object) =>
      object.id === id ? normalizeSceneObject({ ...object, ...patch }) : object,
    ),
  }
}

export function serializeProject(project: EngineProject): string {
  return JSON.stringify(normalizeProject(project), null, 2)
}
