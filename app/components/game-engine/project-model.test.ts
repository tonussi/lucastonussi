import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeProject,
  parseJsonValue,
  serializeProject,
  updateSceneObject,
} from './project-model.ts'
import { defaultEngineProject, type EngineSceneObject } from './types.ts'

const object: EngineSceneObject = {
  id: 'stable-object-id',
  name: 'Crate',
  kind: 'cube',
  position: [0, 1, 2],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#d8a64d',
  visible: true,
  behaviorId: 'breakable-crate',
  properties: { hitPoints: 10, manaPoints: 4, loot: ['coin', { chance: 0.5 }] },
}

test('project serialization round-trips stable identity and nested JSON properties', () => {
  const project = { ...defaultEngineProject, sceneObjects: [object] }
  const restored = normalizeProject(JSON.parse(serializeProject(project)))
  assert.deepEqual(restored.sceneObjects, [object])
})

test('legacy objects receive an empty properties map', () => {
  const legacyObject = { ...object } as Partial<EngineSceneObject>
  delete legacyObject.properties
  const restored = normalizeProject({
    ...defaultEngineProject,
    sceneObjects: [legacyObject as EngineSceneObject],
  })
  assert.deepEqual(restored.sceneObjects[0].properties, {})
})

test('transform updates are immutable and persist in serialized world data', () => {
  const project = { ...defaultEngineProject, sceneObjects: [object] }
  const updated = updateSceneObject(project, object.id, {
    position: [4, 5, 6],
    rotation: [0, Math.PI / 2, 0],
    scale: [2, 2, 2],
  })
  assert.notEqual(updated, project)
  assert.deepEqual(updated.sceneObjects[0].position, [4, 5, 6])
  assert.deepEqual(JSON.parse(serializeProject(updated)).sceneObjects[0].scale, [2, 2, 2])
})

test('property parser accepts every JSON-safe shape and rejects non-JSON numbers', () => {
  assert.deepEqual(parseJsonValue('{"enabled":true,"tags":["a",null,3]}'), {
    enabled: true,
    tags: ['a', null, 3],
  })
  assert.throws(() => parseJsonValue('1e999'))
})
