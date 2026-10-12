import {
  defaultEngineProject,
  type EngineProject,
  type EngineSceneObject,
  type JsonObject,
  type JsonValue,
} from './types.ts'
import { clampTreeSettings } from './tree-generator.ts'

export const ENGINE_PROJECT_STORAGE_KEY = 'lucastonussi:experimental-engine:v1'

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

export function normalizeSceneObject(object: EngineSceneObject): EngineSceneObject {
  const tree = object.kind === 'tree' ? { tree: clampTreeSettings(object.tree) } : {}
  return {
    ...object,
    ...tree,
    position: [...object.position],
    rotation: [...object.rotation],
    scale: [...object.scale],
    properties:
      object.properties && isJsonValue(object.properties) ? (object.properties as JsonObject) : {},
  }
}

export function normalizeProject(input: Partial<EngineProject>): EngineProject {
  return {
    ...defaultEngineProject,
    ...input,
    world: { ...defaultEngineProject.world, ...input.world },
    procedural: { ...defaultEngineProject.procedural, ...input.procedural },
    debug: { ...defaultEngineProject.debug, ...input.debug },
    sceneObjects: Array.isArray(input.sceneObjects)
      ? input.sceneObjects.map((object) => normalizeSceneObject(object))
      : [],
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
