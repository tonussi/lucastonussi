import { createDefaultSceneObjects } from './builtin-objects.ts'
import type { Edge, Node } from '@xyflow/react'

export const DEFAULT_BACKGROUND_COLOR = '#05070d'

export interface EngineWorldSettings {
  fogNear: number
  fogFar: number
  /** Hex color used for the sky background and the fog. */
  backgroundColor: string
}

export interface ProceduralSettings {
  seed: number
  /** Props scattered across the scenario. */
  count: number
  radius: number
  pathCount: number
  lakeCount: number
  riverCount: number
  /** Maximum number of terrace steps between ground cells; 0 is flat. */
  relief: number
  /** Items lying on the ground around the spawn point. */
  pickupCount: number
  /** Rural settlements generated along the walkable paths. */
  villageCount: number
  /** Houses generated in each rural settlement. */
  housesPerVillage: number
  /** Number of trees in the Nepal highland forest. */
  forestTreeCount: number
  /** Medicinal plants scattered near paths for exploration objectives. */
  medicinalPlantCount: number
  groundGrassCount: number
  groundGrassHeight: number
}

export interface EngineDebugSettings {
  collisionShapes: boolean
}

export interface GenerationRecord {
  id: string
  createdAt: string
  seed: number
  count: number
  radius: number
}

export type SceneObjectKind = 'cube' | 'sphere' | 'tree' | 'light' | 'model' | 'ocean' | 'character' | 'grass' | 'cave' | 'house' | 'mountain' | 'grass-plane' | 'rock' | 'path' | 'water' | 'pickup'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export interface TreeSettings {
  height: number
  branchCount: number
  leafCount: number
  leafSize: number
  seed: number
}

export interface GrassSettings {
  bladeCount: number
  height: number
  width: number
  depth: number
  seed: number
}

export interface GrassPlaneSettings {
  width: number
  depth: number
  thickness: number
  bladeCount: number
  bladeHeight: number
  /** 0 keeps a plain rectangle; higher values distort the outline. */
  shapeRandomness: number
  /** Height down to the lower neighbour on each side; above 0 adds a curved grassy bank there. */
  edgeDropPosX: number
  edgeDropNegX: number
  edgeDropPosZ: number
  edgeDropNegZ: number
  /** Bank run as a multiple of its drop (capped). */
  rampRunRatio: number
  seed: number
}

export interface CaveSettings {
  radius: number
  depth: number
  seed: number
}

export interface MountainSettings {
  height: number
  radius: number
  peakCount: number
  roughness: number
  snowLine: number
  seed: number
}

export interface InventorySettings {
  /** Slots shown in every tab. */
  slots: number
  /** One entry per tab; the count of entries is the number of tabs. */
  tabNames: string[]
}

export interface RockSettings {
  size: number
  roughness: number
  /** Height ratio: below 1 squashes the rock into a slab, above 1 stretches it into a pillar. */
  flatness: number
  /** Stretch along the X axis; 1 keeps the footprint round. */
  elongation: number
  seed: number
}

export interface PathSettings {
  length: number
  width: number
  wiggle: number
  seed: number
}

export interface WaterSettings {
  shape: 'lake' | 'river'
  /** Lake radius, or river length. */
  size: number
  /** River width; ignored for lakes. */
  width: number
  wiggle: number
  seed: number
}

export interface PickupSettings {
  itemId: string
  quantity: number
}

export interface CharacterSettings {
  inventory: InventorySettings
  /** Starting attribute values keyed by attribute id from the stats registry. */
  attributes: Record<string, number>
  /** Points the player can spend on attributes during play. */
  unspentPoints: number
  /** Camera orbit speed in radians per second at full stick deflection. */
  cameraRotationSpeed: number
  /** Walking speed in units per second. */
  walkSpeed: number
  /** Running speed in units per second, used while holding the run button. */
  runSpeed: number
  movementResponse: number
  turnResponse: number
  cameraResponse: number
  /** Camera height above the character's feet in first-person view. */
  firstPersonEyeHeight: number
  animationFade: number
  interactClip: string
  /** Peak height of a jump in world units. */
  jumpHeight: number
  /** How long a roll lasts in seconds; the roll clip is sped up to fit. */
  rollDuration: number
  /** Distance covered by a roll in world units. */
  rollDistance: number
  /** Seconds the dodge button must be held before it turns into a run. */
  dashHoldSeconds: number
  /** Duration and resource cost per combat action id from the actions registry. */
  actions: Record<string, { duration: number; cost: number }>
  /** Which equipment is shown on the character. */
  equipment: { sword: boolean; shield: boolean }
  /** Item names per quick-slot category id, cycled with the directional pad. */
  loadout: Record<string, string[]>
  modelId: string
  /** Clip played while standing still; empty selects automatically. */
  idleClip: string
  /** Clip played while moving; empty selects automatically. */
  movingClip: string
  /** Clip played once when rolling; empty selects automatically. */
  rollClip: string
  /** Clip played once while rising after a jump; empty selects automatically. */
  jumpClip: string
  /** Clip played while falling; empty selects automatically. */
  fallClip: string
}

export interface OceanSettings {
  size: number
  segments: number
  waveCount: number
  amplitude: number
  /** Direction the waves travel, in degrees. */
  windDirection: number
  seed: number
}

export interface HouseSettings {
  width: number
  depth: number
  wallHeight: number
  roofHeight: number
}

export interface LightSettings {
  lightType: 'point' | 'spot' | 'directional' | 'ambient'
  intensity: number
  distance: number
  /** Spot cone angle in degrees; ignored for point lights. */
  angle: number
  /** Radius of the circular path the light travels in the horizontal plane; 0 keeps it still. */
  orbitRadius: number
  /** Orbit speed in degrees per second; negative values reverse the direction. */
  orbitSpeed: number
}

export interface ModelSettings {
  /** Key into MODEL_CATALOG; the world JSON never stores file paths or behavior. */
  modelId: string
  collider: 'none' | 'trimesh'
}

export interface EngineSceneObject {
  id: string
  name: string
  kind: SceneObjectKind
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  visible: boolean
  /** Identifier resolved by the runtime; executable behavior never belongs in world JSON. */
  behaviorId?: string
  /** Present only when kind is 'tree'. */
  tree?: TreeSettings
  /** Present only when kind is 'light'. */
  light?: LightSettings
  /** Present only when kind is 'model'. */
  model?: ModelSettings
  /** Present only when kind is 'grass'. */
  grass?: GrassSettings
  /** Present only when kind is 'cave'. */
  cave?: CaveSettings
  /** Present only when kind is 'house'. */
  house?: HouseSettings
  /** Present only when kind is 'mountain'. */
  mountain?: MountainSettings
  /** Present only when kind is 'character'. */
  character?: CharacterSettings
  /** Present only when kind is 'ocean'. */
  ocean?: OceanSettings
  /** Present only when kind is 'rock'. */
  rock?: RockSettings
  /** Present only when kind is 'pickup'. */
  pickup?: PickupSettings
  /** Present only when kind is 'water'. */
  water?: WaterSettings
  /** Present only when kind is 'path'. */
  path?: PathSettings
  /** Present only when kind is 'grass-plane'. */
  grassPlane?: GrassPlaneSettings
  properties: JsonObject
}

export interface EngineProject {
  schemaVersion: 5
  name: string
  updatedAt: string
  world: EngineWorldSettings
  procedural: ProceduralSettings
  debug: EngineDebugSettings
  sceneObjects: EngineSceneObject[]
  flow: {
    nodes: Node[]
    edges: Edge[]
  }
  generations: GenerationRecord[]
}

export const defaultEngineProject: EngineProject = {
  schemaVersion: 5,
  name: 'Experimental World',
  updatedAt: new Date(0).toISOString(),
  world: {
    fogNear: 16,
    fogFar: 78,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
  },
  procedural: {
    seed: 1042,
    count: 120,
    radius: 100,
    pathCount: 0,
    lakeCount: 2,
    riverCount: 2,
    relief: 3,
    pickupCount: 6,
    villageCount: 2,
    housesPerVillage: 5,
    forestTreeCount: 80,
    medicinalPlantCount: 12,
    groundGrassCount: 14400,
    groundGrassHeight: 0.22,
  },
  debug: {
    collisionShapes: false,
  },
  sceneObjects: createDefaultSceneObjects(),
  flow: {
    nodes: [
      {
        id: 'on-start',
        type: 'input',
        position: { x: 24, y: 54 },
        data: { label: 'On world start' },
      },
      {
        id: 'generate',
        position: { x: 238, y: 54 },
        data: { label: 'Generate markers' },
      },
      {
        id: 'ready',
        type: 'output',
        position: { x: 450, y: 54 },
        data: { label: 'World ready' },
      },
    ],
    edges: [
      { id: 'start-generate', source: 'on-start', target: 'generate', animated: true },
      { id: 'generate-ready', source: 'generate', target: 'ready' },
    ],
  },
  generations: [],
}
