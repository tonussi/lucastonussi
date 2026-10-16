import type { EngineSceneObject, JsonObject } from './types.ts'

export const SCENARIO_GENERATED_TAG: JsonObject = { generated: 'scenario' }

export const isScenarioObject = (object: EngineSceneObject) => object.properties?.generated === 'scenario'

export function baseObject(
  id: string,
  name: string,
  kind: EngineSceneObject['kind'],
  color: string,
  position: [number, number, number],
  rotationY: number,
): EngineSceneObject {
  return {
    id,
    name,
    kind,
    position,
    rotation: [0, rotationY, 0],
    scale: [1, 1, 1],
    color,
    visible: true,
    properties: { ...SCENARIO_GENERATED_TAG },
  }
}
