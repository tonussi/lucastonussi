import type { Edge, Node } from '@xyflow/react'

export interface EngineWorldSettings {
  oceanLevel: number
  shipHeight: number
  shipScale: number
  fogNear: number
  fogFar: number
}

export interface ProceduralSettings {
  enabled: boolean
  seed: number
  count: number
  radius: number
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

export type SceneObjectKind = 'cube' | 'sphere' | 'tree'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export interface TreeSettings {
  height: number
  branchCount: number
  leafCount: number
  seed: number
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
  properties: JsonObject
}

export interface EngineProject {
  schemaVersion: 1
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
  schemaVersion: 1,
  name: 'Experimental World',
  updatedAt: new Date(0).toISOString(),
  world: {
    oceanLevel: -50.6,
    shipHeight: -49.35,
    shipScale: 6,
    fogNear: 16,
    fogFar: 78,
  },
  procedural: {
    enabled: true,
    seed: 1042,
    count: 18,
    radius: 14,
  },
  debug: {
    collisionShapes: false,
  },
  sceneObjects: [],
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
