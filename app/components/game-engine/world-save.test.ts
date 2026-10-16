import assert from 'node:assert/strict'
import test from 'node:test'
import { BUILTIN_OBJECT_IDS, createGrassCoverObjects } from './builtin-objects.ts'
import { normalizeProject, serializeProject, updateSceneObject } from './project-model.ts'
import { DEFAULT_BACKGROUND_COLOR, defaultEngineProject } from './types.ts'

test('legacy v1 projects are migrated with the built-in world objects and their old values', () => {
  const migrated = normalizeProject({
    schemaVersion: 1,
    world: { fogNear: 10, fogFar: 50, oceanLevel: -40, shipHeight: -39, shipScale: 3 },
    sceneObjects: [],
  })
  const ids = migrated.sceneObjects.map(({ id }) => id)
  assert.deepEqual(ids, [
    BUILTIN_OBJECT_IDS.ocean,
    BUILTIN_OBJECT_IDS.ship,
    BUILTIN_OBJECT_IDS.character,
    BUILTIN_OBJECT_IDS.redPlateGrass,
    BUILTIN_OBJECT_IDS.bluePlateGrass,
  ])
  assert.equal(migrated.sceneObjects[0].position[1], -40)
  assert.equal(migrated.sceneObjects[1].position[1], -39)
  assert.deepEqual(migrated.sceneObjects[1].scale, [3, 3, 3])
  assert.equal(migrated.world.fogNear, 10)
  assert.equal(migrated.schemaVersion, 3)
})

test('v2 projects are not re-migrated, so deleted built-ins stay deleted', () => {
  const withoutShip = {
    ...defaultEngineProject,
    sceneObjects: defaultEngineProject.sceneObjects.filter(({ id }) => id !== BUILTIN_OBJECT_IDS.ship),
  }
  const restored = normalizeProject(JSON.parse(serializeProject(withoutShip)))
  assert.equal(restored.sceneObjects.some(({ id }) => id === BUILTIN_OBJECT_IDS.ship), false)
})

test('moving the character is stored in the saved world JSON', () => {
  const moved = updateSceneObject(defaultEngineProject, BUILTIN_OBJECT_IDS.character, { position: [3, 1, -2] })
  const saved = JSON.parse(serializeProject(moved))
  const character = saved.sceneObjects.find(({ id }: { id: string }) => id === BUILTIN_OBJECT_IDS.character)
  assert.deepEqual(character.position, [3, 1, -2])
})

test('model objects keep their catalog id and fall back to a valid collider', () => {
  const [, ship] = normalizeProject({ ...defaultEngineProject }).sceneObjects
  assert.deepEqual(ship.model, { modelId: 'pirate-ship', collider: 'trimesh' })
  const broken = normalizeProject({
    ...defaultEngineProject,
    sceneObjects: [{ ...ship, model: { modelId: 'rabbit', collider: 'laser' as never } }],
  })
  assert.equal(broken.sceneObjects[0].model?.collider, 'none')
})

test('v2 worlds gain the plate grass without duplicating their existing objects', () => {
  const [ocean] = defaultEngineProject.sceneObjects
  const migrated = normalizeProject({ schemaVersion: 2, world: defaultEngineProject.world, sceneObjects: [ocean] })
  assert.deepEqual(
    migrated.sceneObjects.map(({ id }) => id),
    [...createGrassCoverObjects().map(({ id }) => id), ocean.id],
  )
})

test('plate grass covers both 20x20 plates at their world positions', () => {
  const [red, blue] = createGrassCoverObjects()
  assert.deepEqual(red.position, [0, -10, 0])
  assert.deepEqual(blue.position, [-20, -20, 0])
  assert.ok([red, blue].every(({ grass }) => grass?.width === 20 && grass.depth === 20))
})

test('world background color round-trips, and invalid or missing colors fall back to the default', () => {
  const custom = normalizeProject({ ...defaultEngineProject, world: { ...defaultEngineProject.world, backgroundColor: '#1A2B3C' } })
  assert.equal(custom.world.backgroundColor, '#1a2b3c')
  assert.equal(normalizeProject(JSON.parse(serializeProject(custom))).world.backgroundColor, '#1a2b3c')
  const invalid = normalizeProject({ ...defaultEngineProject, world: { ...defaultEngineProject.world, backgroundColor: 'red' } })
  assert.equal(invalid.world.backgroundColor, DEFAULT_BACKGROUND_COLOR)
  assert.equal(normalizeProject({ world: { fogNear: 1, fogFar: 2 } }).world.backgroundColor, DEFAULT_BACKGROUND_COLOR)
})
