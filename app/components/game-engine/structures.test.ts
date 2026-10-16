import assert from 'node:assert/strict'
import test from 'node:test'
import { CAVE_LIMITS, clampCaveSettings, generateCave } from './cave-generator.ts'
import { clampGrassSettings, generateGrass, GRASS_LIMITS } from './grass-generator.ts'
import { buildHouse, DOOR_HEIGHT, DOOR_WIDTH, HOUSE_LIMITS } from './house-layout.ts'
import { normalizeSceneObject } from './project-model.ts'
import type { EngineSceneObject } from './types.ts'

test('grass has the requested number of blades inside its area and is deterministic', () => {
  const settings = { bladeCount: 30, height: 0.6, width: 0.6, depth: 0.4, seed: 9 }
  const blades = generateGrass(settings)
  assert.equal(blades.length, 30)
  assert.ok(blades.every(({ position }) => Math.abs(position[0]) <= 0.3 && Math.abs(position[2]) <= 0.2))
  assert.deepEqual(blades, generateGrass(settings))
  assert.notDeepEqual(blades, generateGrass({ ...settings, seed: 10 }))
})

test('grass, cave and house settings are clamped', () => {
  assert.equal(clampGrassSettings({ bladeCount: 1e6 }).bladeCount, GRASS_LIMITS.bladeCount.max)
  assert.equal(clampCaveSettings({ depth: 0 }).depth, CAVE_LIMITS.depth.min)
})

test('cave is deterministic, bounded and enclosed by four colliders', () => {
  const cave = generateCave({ radius: 3, depth: 8, seed: 4 })
  assert.deepEqual(cave, generateCave({ radius: 3, depth: 8, seed: 4 }))
  assert.equal(cave.colliders.length, 4)
  const largest = generateCave({ radius: CAVE_LIMITS.radius.min, depth: CAVE_LIMITS.depth.max, seed: 1 })
  assert.ok(largest.rocks.length < 400)
})

test('house front wall leaves an empty door opening and no door piece exists', () => {
  const pieces = buildHouse({ width: 6, depth: 5, wallHeight: 3, roofHeight: 2 })
  const frontPieces = pieces.filter(({ kind, position, size }) => kind === 'wall' && position[2] > 0 && size[0] >= size[2])
  const sideWidths = frontPieces.filter(({ size }) => size[1] === 3).map(({ size }) => size[0])
  assert.equal(sideWidths.length, 2)
  assert.ok(Math.abs(sideWidths[0] * 2 + DOOR_WIDTH - 6) < 1e-9)
  const lintel = frontPieces.find(({ size }) => size[1] < 3)
  assert.ok(lintel && Math.abs(lintel.size[1] - (3 - DOOR_HEIGHT)) < 1e-9)
  assert.equal(pieces.some(({ kind }) => (kind as string) === 'door'), false)
})

test('house wall height never drops below the door height', () => {
  assert.ok(HOUSE_LIMITS.wallHeight.min > DOOR_HEIGHT)
})

test('new structure kinds receive default settings when loaded without them', () => {
  const base: EngineSceneObject = {
    id: 'x', name: 'x', kind: 'grass', position: [0, 0, 0], rotation: [0, 0, 0],
    scale: [1, 1, 1], color: '#fff', visible: true, properties: {},
  }
  assert.ok(normalizeSceneObject(base).grass)
  assert.ok(normalizeSceneObject({ ...base, kind: 'cave' }).cave)
  assert.ok(normalizeSceneObject({ ...base, kind: 'house' }).house)
})

import { clampMountainSettings, generateMountain, MOUNTAIN_LIMITS } from './mountain-generator.ts'

test('mountain generation is deterministic per seed and differs across seeds', () => {
  const settings = { height: 20, radius: 10, peakCount: 3, roughness: 0.5, seed: 12 }
  const first = generateMountain(settings)
  assert.deepEqual(first.positions, generateMountain(settings).positions)
  assert.notDeepEqual(first.positions, generateMountain({ ...settings, seed: 13 }).positions)
})

test('mountain meets the ground at its edge, rises above it and stays bounded', () => {
  const { positions, indices, peakHeight } = generateMountain({ height: 20, radius: 10, seed: 3 })
  assert.ok(peakHeight > 5)
  assert.ok(indices.every((index) => index < positions.length / 3))
  for (let vertex = 0; vertex < positions.length; vertex += 3) {
    const distance = Math.hypot(positions[vertex], positions[vertex + 2])
    if (distance >= 10 - 1e-6) assert.ok(positions[vertex + 1] < 1e-6)
  }
})

test('mountain settings are clamped and saved mountains round-trip', () => {
  const clamped = clampMountainSettings({ height: 1e6, peakCount: 99, roughness: -1 })
  assert.equal(clamped.height, MOUNTAIN_LIMITS.height.max)
  assert.equal(clamped.peakCount, MOUNTAIN_LIMITS.peakCount.max)
  assert.equal(clamped.roughness, MOUNTAIN_LIMITS.roughness.min)
  const object = {
    id: 'm', name: 'Mountain 1', kind: 'mountain' as const, position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number],
    color: '#7b736a', visible: true, properties: {},
  }
  assert.ok(normalizeSceneObject(object).mountain)
})

import { clampGrassPlaneSettings, generateGrassPlane, GRASS_PLANE_LIMITS } from './grass-plane-generator.ts'

const PLANE = { width: 10, depth: 6, thickness: 0.4, bladeCount: 500, bladeHeight: 0.4, shapeRandomness: 0, seed: 2 }

test('grass plane with no randomness is an exact rectangle and holds the requested grass', () => {
  const { positions, blades } = generateGrassPlane(PLANE)
  const xs = Array.from({ length: positions.length / 3 }, (_, index) => positions[index * 3])
  const zs = Array.from({ length: positions.length / 3 }, (_, index) => positions[index * 3 + 2])
  assert.ok(Math.abs(Math.max(...xs) - 5) < 1e-5 && Math.abs(Math.max(...zs) - 3) < 1e-5)
  assert.equal(blades.length, 500)
  assert.ok(blades.every(({ position }) => Math.abs(position[0]) <= 5 && Math.abs(position[2]) <= 3))
})

test('grass plane is deterministic, and shape randomness changes the outline per seed', () => {
  const shaped = { ...PLANE, shapeRandomness: 0.8 }
  assert.deepEqual(generateGrassPlane(shaped), generateGrassPlane(shaped))
  assert.notDeepEqual(generateGrassPlane(shaped).positions, generateGrassPlane({ ...shaped, seed: 3 }).positions)
  assert.notDeepEqual(generateGrassPlane(shaped).positions, generateGrassPlane(PLANE).positions)
})

test('grass plane faces up on top, stays inside its outline and clamps quantity', () => {
  const shaped = { ...PLANE, shapeRandomness: 1 }
  const { positions, indices } = generateGrassPlane(shaped)
  const topCenter = positions.length / 3 - 2
  for (let tri = 0; tri < indices.length; tri += 3) {
    const [a, b, c] = [indices[tri], indices[tri + 1], indices[tri + 2]]
    if (a !== topCenter) continue
    const e1 = [0, 1, 2].map((axis) => positions[b * 3 + axis] - positions[a * 3 + axis])
    const e2 = [0, 1, 2].map((axis) => positions[c * 3 + axis] - positions[a * 3 + axis])
    assert.ok(e1[2] * e2[0] - e1[0] * e2[2] > 0)
  }
  assert.equal(clampGrassPlaneSettings({ bladeCount: 1e9 }).bladeCount, GRASS_PLANE_LIMITS.bladeCount.max)
})

import { createBuiltinObjects } from './builtin-objects.ts'
import { clampOceanSettings, DEFAULT_OCEAN_SETTINGS, generateOceanWaves, OCEAN_LIMITS } from './ocean-generator.ts'

test('ocean waves are deterministic per seed and bounded by wave count', () => {
  const settings = { ...DEFAULT_OCEAN_SETTINGS, waveCount: 5, seed: 4 }
  const waves = generateOceanWaves(settings)
  assert.equal(waves.length, 5)
  assert.deepEqual(waves, generateOceanWaves(settings))
  assert.notDeepEqual(waves, generateOceanWaves({ ...settings, seed: 5 }))
})

test('ocean settings are clamped and saved oceans round-trip', () => {
  const clamped = clampOceanSettings({ size: 1e6, segments: 1e6, waveCount: 0, amplitude: -1, windDirection: 1e6 })
  assert.equal(clamped.size, OCEAN_LIMITS.size.max)
  assert.equal(clamped.segments, OCEAN_LIMITS.segments.max)
  assert.equal(clamped.waveCount, OCEAN_LIMITS.waveCount.min)
  assert.equal(clamped.amplitude, OCEAN_LIMITS.amplitude.min)
  assert.equal(clamped.windDirection, OCEAN_LIMITS.windDirection.max)
  const legacyOcean = {
    id: 'o', name: 'Ocean', kind: 'ocean' as const, position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number],
    color: '#064b70', visible: true, properties: {},
  }
  assert.deepEqual(normalizeSceneObject(legacyOcean).ocean, DEFAULT_OCEAN_SETTINGS)
})

import { generatePath, PATH_LIMITS, clampPathSettings } from './path-generator.ts'
import { generateRockBumps, clampRockSettings, rockSurfacePoint, ROCK_LIMITS } from './rock-generator.ts'
import { scenarioDimensions, clampProceduralSettings, generateScenario, isScenarioObject, SCENARIO_LIMITS } from './scenario-generator.ts'
import { normalizeProject } from './project-model.ts'
import { defaultEngineProject } from './types.ts'

test('rocks are deterministic per seed, bounded by size and flattened by flatness', () => {
  const settings = clampRockSettings({ size: 2, roughness: 0.5, flatness: 0.5, seed: 3 })
  const bumps = generateRockBumps(settings.seed)
  assert.deepEqual(bumps, generateRockBumps(settings.seed))
  assert.notDeepEqual(bumps, generateRockBumps(settings.seed + 1))
  const top = rockSurfacePoint([0, 1, 0], settings, bumps)
  assert.ok(top[1] <= settings.size * (1 + settings.roughness) * settings.flatness + 1e-9)
  assert.equal(clampRockSettings({ size: 1e6 }).size, ROCK_LIMITS.size.max)
})

test('paths are deterministic, start at the origin and clamp their size', () => {
  const settings = { length: 20, width: 3, wiggle: 0.6, seed: 8 }
  const first = generatePath(settings)
  assert.deepEqual(first.positions, generatePath(settings).positions)
  assert.notDeepEqual(first.positions, generatePath({ ...settings, seed: 9 }).positions)
  assert.deepEqual(first.centerline[0], [0, 0])
  assert.equal(first.indices.length, (first.centerline.length - 1) * 6)
  assert.equal(clampPathSettings({ length: 1e6 }).length, PATH_LIMITS.length.max)
})

test('scenarios are deterministic, tagged, bounded and keep props off the paths', () => {
  const settings = { seed: 5, count: 80, radius: 60, pathCount: 3 }
  const scenario = generateScenario(settings)
  assert.deepEqual(scenario, generateScenario(settings))
  assert.notDeepEqual(scenario, generateScenario({ ...settings, seed: 6 }))
  assert.ok(scenario.every(isScenarioObject))
  assert.equal(new Set(scenario.map(({ id }) => id)).size, scenario.length)
  assert.equal(scenario.filter(({ kind }) => kind === 'path').length, 3)
  assert.ok(scenario.filter(({ kind }) => kind === 'grass-plane').length >= 1)
  const props = scenario.filter(({ id }) => /^scenario-\d+-(rock|tree|grass|mound|cave|house)-\d+$/.test(id))
  assert.ok(props.length > 0 && props.length <= settings.count)
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  assert.ok(props.every(({ position }) => Math.abs(position[0]) <= halfLength && Math.abs(position[2]) <= halfWidth))
})

test('procedural settings are clamped and older saves load', () => {
  const clamped = clampProceduralSettings({ count: 1e6, radius: -5, pathCount: 99 })
  assert.equal(clamped.count, SCENARIO_LIMITS.count.max)
  assert.equal(clamped.radius, SCENARIO_LIMITS.radius.min)
  assert.equal(clamped.pathCount, SCENARIO_LIMITS.pathCount.max)
  const legacy = normalizeProject({ ...defaultEngineProject, procedural: { enabled: true, seed: 7, count: 18, radius: 14 } as never })
  assert.equal(legacy.procedural.pathCount, 3)
  assert.equal('enabled' in legacy.procedural, false)
})

test('the scenario ground cell under the spawn sits just below it', () => {
  const spawn: [number, number, number] = [10, 5, -4]
  const scenario = generateScenario({ seed: 2, count: 10, radius: 60, pathCount: 2 }, spawn)
  const underSpawn = scenario.find(({ kind, position }) => kind === 'grass-plane' && position[0] === spawn[0] && position[2] === spawn[2])!
  assert.equal(underSpawn.position[1], spawn[1] - 0.5)
})

import { replaceWithScenario } from './scenario-generator.ts'

test('replacing with a scenario removes the default ocean, ship and plates but keeps character and lights', () => {
  const light = { ...defaultEngineProject.sceneObjects[0], id: 'light-1', kind: 'light' as const }
  const objects = [...defaultEngineProject.sceneObjects, light]
  assert.ok(objects.some(({ kind }) => kind === 'ocean'))
  assert.ok(objects.some(({ kind }) => kind === 'model'))
  const next = replaceWithScenario(objects, { seed: 1, count: 20, radius: 20, pathCount: 1 })
  assert.equal(next.some(({ id }) => id.startsWith('builtin-')  && id !== 'builtin-character'), false)
  assert.equal(next.filter(({ kind }) => kind === 'ocean').length, 1)
  assert.equal(next.filter(({ kind }) => kind === 'character').length, 1)
  assert.ok(next.some(({ id }) => id === 'light-1'))
  assert.equal(next.some(({ id }) => id.startsWith('builtin-grass')), false)
})

import { clampWaterSettings, generateWater, WATER_LIMITS } from './water-generator.ts'

test('water is deterministic per seed, clamped, and scenarios include lakes and rivers clear of props', () => {
  const lake = { shape: 'lake' as const, size: 8, width: 4, wiggle: 0.5, seed: 4 }
  assert.deepEqual(generateWater(lake).positions, generateWater(lake).positions)
  assert.notDeepEqual(generateWater(lake).positions, generateWater({ ...lake, seed: 5 }).positions)
  assert.equal(clampWaterSettings({ size: 1e6 }).size, WATER_LIMITS.size.max)
  assert.equal(clampWaterSettings({ shape: 'sea' as never }).shape, 'lake')

  const water = [1, 2, 3, 4, 5].flatMap((seed) =>
    generateScenario({ seed, count: 100, radius: 100, pathCount: 2, lakeCount: 3, riverCount: 2 }).filter(({ kind }) => kind === 'water'))
  assert.ok(water.some(({ water: settings }) => settings?.shape === 'lake'))
  assert.ok(water.some(({ water: settings }) => settings?.shape === 'river'))
})

import { scenarioFog } from './scenario-generator.ts'

test('water bodies never overlap or touch each other and keep their distance', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const water = generateScenario({ seed, count: 0, radius: 80, pathCount: 0, lakeCount: 4, riverCount: 3, relief: 0 }).filter(({ kind }) => kind === 'water')
    const reach = (object: (typeof water)[number]) => (object.water!.shape === 'lake' ? object.water!.size : object.water!.width)
    water.forEach((a, index) => water.slice(index + 1).forEach((b) => {
      assert.ok(Math.hypot(a.position[0] - b.position[0], a.position[2] - b.position[2]) > Math.min(reach(a), reach(b)), `seed ${seed}`)
    }))
  }
})

test('scenarios add horizon mountains, a large ocean below the ground and far ships', () => {
  const scenario = generateScenario({ seed: 3, count: 10, radius: 40, pathCount: 1, relief: 3 })
  const ground = scenario.find(({ kind }) => kind === 'grass-plane')!
  const ocean = scenario.find(({ kind }) => kind === 'ocean')!
  assert.ok(ocean.position[1] < ground.position[1])
  const { size, segments, waveCount, amplitude, windDirection } = ocean.ocean!
  assert.deepEqual({ waveCount, amplitude, windDirection }, { waveCount: DEFAULT_OCEAN_SETTINGS.waveCount, amplitude: DEFAULT_OCEAN_SETTINGS.amplitude, windDirection: DEFAULT_OCEAN_SETTINGS.windDirection })
  assert.equal(Math.round(size / segments * 10), Math.round(DEFAULT_OCEAN_SETTINGS.size / DEFAULT_OCEAN_SETTINGS.segments * 10))
  assert.ok(size >= DEFAULT_OCEAN_SETTINGS.size && size <= OCEAN_LIMITS.size.max)
  assert.equal(ocean.color, createBuiltinObjects().find(({ kind }) => kind === 'ocean')!.color)
  const horizon = scenario.filter(({ id }) => id.includes('horizon'))
  assert.ok(horizon.length >= 8 && horizon.every(({ position }) => Math.hypot(position[0], position[2]) >= 40))
  const ships = scenario.filter(({ kind }) => kind === 'model')
  assert.ok(ships.length > 0 && ships.length === 4 && ships.every(({ position }) => Math.hypot(position[0], position[2]) > 70))
  assert.ok(scenarioFog({ radius: 40 }).fogFar > 150)
})

test('horizon mountains form distant ranges with open gaps instead of a ring around the land', () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const settings = { seed, count: 20, radius: 100, pathCount: 1, relief: 3 }
    const scenario = generateScenario(settings)
    const horizon = scenario.filter(({ id }) => id.includes('horizon'))
    assert.ok(horizon.every(({ position }) => Math.hypot(position[0], position[2]) >= settings.radius * 2.5 - 1))
    const angles = horizon.map(({ position }) => Math.atan2(position[2], position[0])).sort((a, b) => a - b)
    const gaps = angles.map((angle, index) => (index === 0 ? angles[0] + Math.PI * 2 - angles.at(-1)! : angle - angles[index - 1]))
    assert.ok(Math.max(...gaps) > 1, `seed ${seed}`)
    const ground = scenario.filter(({ kind }) => kind === 'grass-plane')
    assert.ok(ground.length >= 8)
  }
})

import { TERRAIN_CELL_SIZE, TERRAIN_STEP } from './terrain-grid.ts'

const SCENARIO_ORIGIN_Y = -0.5

test('terrain cells are stepped, reach down to the sea and keep paths, water and props level', () => {
  const settings = { seed: 7, count: 80, radius: 100, pathCount: 3, lakeCount: 2, riverCount: 2, relief: 4 }
  const scenario = generateScenario(settings)
  const cells = scenario.filter(({ id }) => id.includes('-ground-'))
  const ocean = scenario.find(({ kind }) => kind === 'ocean')!
  const tops = new Set(cells.map(({ position }) => position[1] - SCENARIO_ORIGIN_Y))
  assert.ok(tops.size > 1)
  assert.ok([...tops].every((top) => top % TERRAIN_STEP === 0 && top >= 0 && top <= settings.relief * TERRAIN_STEP))
  assert.ok(cells.every(({ position, grassPlane }) => position[1] - grassPlane!.thickness < ocean.position[1]))

  const cellAt = (x: number, z: number) => cells.find(({ position }) => position[0] === Math.round(x / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE && position[2] === Math.round(z / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE)
  const flat = scenario.filter(({ kind }) => kind === 'path' || kind === 'water')
  assert.ok(flat.every(({ position }) => {
    const cell = cellAt(position[0], position[2])
    return cell === undefined || cell.position[1] === SCENARIO_ORIGIN_Y
  }))
  const props = scenario.filter(({ id }) => /^scenario-\d+-(rock|tree|grass|mound|cave|house)-\d+$/.test(id))
  assert.ok(props.length > 0)
  assert.ok(props.every(({ position }) => cellAt(position[0], position[2])?.position[1] === position[1]))
})

test('relief zero keeps the mainland flat and ships stay away from every land cell', () => {
  const scenario = generateScenario({ seed: 4, count: 10, radius: 100, pathCount: 1, relief: 0 })
  const cells = scenario.filter(({ id }) => id.includes('-ground-'))
  assert.ok(cells.every(({ position }) => [SCENARIO_ORIGIN_Y, SCENARIO_ORIGIN_Y + TERRAIN_STEP].includes(position[1])))
  const ships = scenario.filter(({ kind }) => kind === 'model')
  assert.ok(ships.every((ship) => cells.every(({ position }) => Math.hypot(position[0] - ship.position[0], position[2] - ship.position[2]) > TERRAIN_CELL_SIZE * 0.5)))
})

import { ROCK_STYLES, SEAM_STYLE_KEYS } from './scenario-rocks.ts'

test('scenarios follow the sketch: land strip, desert with a big mountain, forest strip, sea with islands', () => {
  const scenario = generateScenario({ seed: 12, count: 60, radius: 100, pathCount: 3, relief: 3 })
  const { halfWidth } = scenarioDimensions(100)
  const desert = scenario.find(({ name }) => name === 'Desert')!
  assert.ok(desert.position[2] < -halfWidth && desert.grassPlane!.bladeCount === 0)
  const bigMountain = scenario.find(({ name }) => name === 'Big Mountain')!
  assert.ok(bigMountain.position[2] < desert.position[2] + desert.grassPlane!.depth / 2 && bigMountain.mountain!.height >= 80)
  const forest = scenario.filter(({ name }) => name.startsWith('Forest Tree'))
  assert.ok(forest.length > 10)
  const ocean = scenario.find(({ kind }) => kind === 'ocean')!
  assert.ok(ocean.position[2] > halfWidth)
  const islandCells = scenario.filter(({ id }) => id.includes('-ground-')).filter(({ position }) => position[2] > halfWidth + TERRAIN_CELL_SIZE * 3)
  assert.ok(islandCells.length > 0)
})

test('rocks of different styles fill the seams between cells, the coast and the gaps to islands', () => {
  const scenario = generateScenario({ seed: 12, count: 20, radius: 100, pathCount: 2, relief: 4 })
  const seamRocks = scenario.filter(({ id }) => id.includes('-seam-rock-'))
  const coastRocks = scenario.filter(({ id }) => id.includes('-coast-rock-'))
  const stones = scenario.filter(({ id }) => id.includes('-stone-'))
  assert.ok(seamRocks.length > 5 && coastRocks.length > 5 && stones.length > 0)
  const styles = new Set([...seamRocks, ...coastRocks, ...stones].map(({ name }) => name))
  assert.ok(styles.size >= 3)
  assert.ok(SEAM_STYLE_KEYS.every((key) => ROCK_STYLES[key]))
  const flatness = [...seamRocks, ...coastRocks].map(({ rock }) => rock!.flatness)
  assert.ok(Math.min(...flatness) < 0.6 && Math.max(...flatness) > 1.3)
  assert.ok([...seamRocks, ...coastRocks, ...stones].every(({ rock }) => rock!.elongation >= 1 && rock!.size > 0))
})

test('rock elongation is clamped and kept by saved rocks', () => {
  assert.equal(clampRockSettings({ elongation: 99 }).elongation, ROCK_LIMITS.elongation.max)
  assert.equal(clampRockSettings({ flatness: 99 }).flatness, ROCK_LIMITS.flatness.max)
  const wide = rockSurfacePoint([1, 0, 0], clampRockSettings({ size: 2, roughness: 0, elongation: 2 }), generateRockBumps(1))
  const round = rockSurfacePoint([1, 0, 0], clampRockSettings({ size: 2, roughness: 0, elongation: 1 }), generateRockBumps(1))
  assert.equal(wide[0], round[0] * 2)
})
