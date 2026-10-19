import assert from 'node:assert/strict'
import test from 'node:test'
import { CAVE_LIMITS, clampCaveSettings, generateCave } from './cave-generator.ts'
import { clampGrassSettings, generateGrass, GRASS_LIMITS } from './grass-generator.ts'
import { buildHouse, buildHouseWindows, DOOR_HEIGHT, DOOR_WIDTH, HOUSE_LIMITS } from './house-layout.ts'
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
  const pieces = buildHouse({ width: 6, depth: 5, wallHeight: 4.5, roofHeight: 2 })
  const frontPieces = pieces.filter(({ kind, position, size }) => kind === 'wall' && position[2] > 0 && size[0] >= size[2])
  const doorway = frontPieces.filter(({ position, size }) => Math.abs(position[0]) < DOOR_WIDTH / 2 && position[1] - size[1] / 2 < DOOR_HEIGHT)
  assert.equal(doorway.length, 0)
  const lintel = frontPieces.find(({ position }) => Math.abs(position[0]) < 1e-9)
  assert.ok(lintel && Math.abs(lintel.size[1] - (4.5 - DOOR_HEIGHT)) < 1e-9)
  assert.equal(pieces.some(({ kind }) => (kind as string) === 'door'), false)
})

test('house windows are real openings: no solid piece covers the glass area', () => {
  const settings = { width: 8, depth: 7, wallHeight: 4.5, roofHeight: 2 }
  const windows = buildHouseWindows(settings)
  assert.ok(windows.length >= 4)
  const walls = buildHouse(settings).filter(({ kind }) => kind === 'wall')
  windows.forEach(({ position, size, axis }) => {
    const half = size[0] / 2 - 1e-6
    const covers = walls.some((wall) => {
      const along = axis === 'x' ? [wall.position[0], wall.size[0]] : [wall.position[2], wall.size[2]]
      const across = axis === 'x' ? wall.position[2] : wall.position[0]
      const sameWall = Math.abs(across - (axis === 'x' ? position[2] : position[0])) < 1e-6
      const centerAlong = axis === 'x' ? position[0] : position[2]
      const overlapsAlong = Math.abs(along[0] - centerAlong) < along[1] / 2 + half
      const overlapsHeight = Math.abs(wall.position[1] - position[1]) < wall.size[1] / 2 + size[1] / 2 - 1e-6
      return sameWall && overlapsAlong && overlapsHeight
    })
    assert.equal(covers, false)
  })
})

test('house wall height never drops below the door height', () => {
  assert.ok(HOUSE_LIMITS.wallHeight.min > DOOR_HEIGHT)
  assert.ok(DOOR_HEIGHT >= 2.9 && DOOR_WIDTH >= 2, 'the character body is about 1.6 wide and 2.8 tall when resting on the ground')
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
import { scenarioDimensions, clampProceduralSettings, generateScenario, isScenarioObject, SCENARIO_LIMITS, MOUND_SINK } from './scenario-generator.ts'
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

test('scenarios are deterministic, tagged, bounded and have no ground trails', () => {
  const settings = { seed: 5, count: 80, radius: 60, pathCount: 3 }
  const scenario = generateScenario(settings)
  assert.deepEqual(scenario, generateScenario(settings))
  assert.notDeepEqual(scenario, generateScenario({ ...settings, seed: 6 }))
  assert.ok(scenario.every(isScenarioObject))
  assert.equal(new Set(scenario.map(({ id }) => id)).size, scenario.length)
  assert.equal(scenario.filter(({ kind }) => kind === 'path').length, 0)
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
  assert.equal(clamped.pathCount, 0)
  const legacy = normalizeProject({ ...defaultEngineProject, procedural: { enabled: true, seed: 7, count: 18, radius: 14 } as never })
  assert.equal(legacy.procedural.pathCount, 0)
  assert.equal('enabled' in legacy.procedural, false)
})

test('the scenario ground cell under the spawn sits just below it', () => {
  const spawn: [number, number, number] = [10, 5, -4]
  const scenario = generateScenario({ seed: 2, count: 10, radius: 60, pathCount: 2 }, spawn)
  const underSpawn = scenario.find(({ kind, position }) => kind === 'grass-plane' && position[0] === spawn[0] && position[2] === spawn[2])!
  assert.equal(underSpawn.position[1], spawn[1] - 0.5)
})

import { replaceWithScenario } from './scenario-generator.ts'

test('replacing with the Nepal scenario removes the default ocean, ship and plates but keeps character and lights', () => {
  const light = { ...defaultEngineProject.sceneObjects[0], id: 'light-1', kind: 'light' as const }
  const objects = [...defaultEngineProject.sceneObjects, light]
  assert.ok(objects.some(({ kind }) => kind === 'ocean'))
  assert.ok(objects.some(({ kind }) => kind === 'model'))
  const next = replaceWithScenario(objects, { seed: 1, count: 20, radius: 20, pathCount: 1 })
  assert.equal(next.some(({ id }) => id.startsWith('builtin-')  && id !== 'builtin-character'), false)
  assert.equal(next.filter(({ kind }) => kind === 'ocean').length, 0)
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

test('scenarios add distant non-colliding blue and white Himalayan peaks', () => {
  const scenario = generateScenario({ seed: 3, count: 10, radius: 40, pathCount: 1, relief: 3 })
  const ground = scenario.find(({ kind }) => kind === 'grass-plane')!
  const horizon = scenario.filter(({ id }) => id.includes('horizon'))
  assert.ok(horizon.length >= 8 && horizon.every(({ position }) => Math.hypot(position[0], position[2]) >= 40))
  assert.ok(horizon.every(({ name, color, mountain, properties }) =>
    name.startsWith('Himalayan Peak') && color === '#496985' && mountain!.snowLine === 0.5 && properties.collision === 'none'))
  assert.equal(scenario.some(({ kind }) => kind === 'ocean' || kind === 'model'), false)
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
  const tops = new Set(cells.map(({ position }) => position[1] - SCENARIO_ORIGIN_Y))
  assert.ok(tops.size > 1)
  assert.ok([...tops].every((top) => top % TERRAIN_STEP === 0 && top >= 0 && top <= settings.relief * TERRAIN_STEP))
  assert.ok(cells.every(({ position, grassPlane }) => position[1] - grassPlane!.thickness < -1))

  const cellAt = (x: number, z: number) => cells.find(({ position }) => position[0] === Math.round(x / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE && position[2] === Math.round(z / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE)
  const flat = scenario.filter(({ kind }) => kind === 'path' || kind === 'water')
  assert.ok(flat.every(({ position }) => {
    const cell = cellAt(position[0], position[2])
    return cell === undefined || cell.position[1] === SCENARIO_ORIGIN_Y
  }))
  const props = scenario.filter(({ id }) => /^scenario-\d+-(rock|tree|grass|mound|cave|house)-\d+$/.test(id))
  assert.ok(props.length > 0)
  assert.ok(props.every(({ id, position }) => Math.abs((cellAt(position[0], position[2])?.position[1] ?? NaN) - position[1] - (id.includes('-mound-') ? MOUND_SINK : 0)) < 1e-9))
  assert.ok(props.some(({ id }) => id.includes('-mound-')))
})

test('relief zero keeps the mainland flat and ships stay away from every land cell', () => {
  const scenario = generateScenario({ seed: 4, count: 10, radius: 100, pathCount: 1, relief: 0 })
  const cells = scenario.filter(({ id }) => id.includes('-ground-'))
  assert.ok(cells.every(({ position }) => [SCENARIO_ORIGIN_Y, SCENARIO_ORIGIN_Y + TERRAIN_STEP].includes(position[1])))
  const ships = scenario.filter(({ kind }) => kind === 'model')
  assert.ok(ships.every((ship) => cells.every(({ position }) => Math.hypot(position[0] - ship.position[0], position[2] - ship.position[2]) > TERRAIN_CELL_SIZE * 0.5)))
})

import { ROCK_STYLES, SEAM_STYLE_KEYS } from './scenario-rocks.ts'

test('scenarios follow the Nepal theme with villages, varied forest and medicinal plants', () => {
  const scenario = generateScenario({ seed: 12, count: 60, radius: 100, pathCount: 3, relief: 3 })
  const houses = scenario.filter(({ properties }) => typeof properties.settlement === 'string')
  assert.ok(houses.length >= 2)
  assert.ok(new Set(houses.map(({ properties }) => properties.settlement)).size >= 1)
  const forest = scenario.filter(({ properties }) => properties.biome === 'nepal-highland-forest')
  assert.ok(forest.length > 10)
  assert.ok(new Set(forest.map(({ color }) => color)).size >= 3)
  const medicinal = scenario.filter(({ properties }) => properties.objectiveKind === 'medicinal-plant')
  assert.ok(medicinal.length > 3)
  assert.ok(medicinal.every(({ pickup }) => ['healing-herb', 'blue-juniper', 'mountain-root'].includes(pickup!.itemId)))
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
import { Vector3 } from 'three'
import { createVegetationMask } from './vegetation-footprint.ts'

test('grass excludes transformed house interiors and lake and river surfaces', () => {
  const objects = generateScenario({ seed: 1042, lakeCount: 2, riverCount: 2 })
  const house = objects.find(o => o.kind === 'house')!
  const rotated = { ...house, position: [10, 0, 20] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], scale: [2, 1, 1] as [number, number, number] }
  const mask = createVegetationMask([rotated])
  assert.equal(mask(new Vector3(10, 0, 20)), true)
  assert.equal(mask(new Vector3(100, 0, 100)), false)
  assert.equal(createVegetationMask([{ ...rotated, visible: false }])(new Vector3(10, 0, 20)), false)
  for (const water of objects.filter(o => o.kind === 'water')) {
    assert.equal(createVegetationMask([water])(new Vector3(...water.position)), true)
  }
})
import { broadenHorizonMountain } from './horizon-profile.ts'

test('horizon peaks have broad smooth silhouettes and the profile applies only once', () => {
  const peaks = generateScenario({ seed: 42, count: 0 }).filter(o => o.properties.landmark === 'himalaya')
  assert.ok(peaks.length > 0)
  for (const peak of peaks) {
    assert.ok(peak.mountain!.radius * peak.scale[0] >= 110)
    assert.ok(peak.mountain!.roughness <= 0.12)
    assert.equal(peak.mountain!.peakCount, 2)
    assert.equal(broadenHorizonMountain(peak), peak)
    const edited = { ...peak, scale: [3, 1, 3] as [number, number, number] }
    assert.equal(broadenHorizonMountain(edited), edited)
  }
})

test('grass plane edge drops add a curved, upward-facing bank that reaches the lower ground', async () => {
  const { rampRun } = await import('./grass-plane-generator.ts')
  const flat = generateGrassPlane(PLANE)
  assert.equal(flat.rampIndices.length, 0)
  const banked = generateGrassPlane({ ...PLANE, edgeDropPosX: 2, edgeDropPosZ: 4 })
  assert.deepEqual(banked, generateGrassPlane({ ...PLANE, edgeDropPosX: 2, edgeDropPosZ: 4 }))
  const { rampPositions: p, rampIndices: i } = banked
  assert.ok(i.length > 0)
  for (let tri = 0; tri < i.length; tri += 3) {
    const [a, b, c] = [i[tri] * 3, i[tri + 1] * 3, i[tri + 2] * 3]
    const up = (p[b + 2] - p[a + 2]) * (p[c] - p[a]) - (p[b] - p[a]) * (p[c + 2] - p[a + 2])
    assert.ok(up > 0)
  }
  const ys = Array.from({ length: p.length / 3 }, (_, index) => p[index * 3 + 1])
  assert.ok(Math.max(...ys) <= 1e-9 && Math.min(...ys) < -4)
  const single = generateGrassPlane({ ...PLANE, edgeDropPosX: 2 }).rampPositions
  const xs = Array.from({ length: single.length / 3 }, (_, index) => single[index * 3])
  assert.ok(Math.abs(Math.max(...xs) - (PLANE.width / 2 + rampRun(2))) < 1e-5)
  assert.ok(banked.blades.length > flat.blades.length)
  assert.equal(generateGrassPlane({ ...PLANE, shapeRandomness: 0.5, edgeDropPosX: 2 }).rampIndices.length, 0)
  const clamped = clampGrassPlaneSettings({ edgeDropNegZ: 1e6, rampRunRatio: -1 })
  assert.equal(clamped.edgeDropNegZ, GRASS_PLANE_LIMITS.edgeDrop.max)
  assert.equal(clamped.rampRunRatio, GRASS_PLANE_LIMITS.rampRunRatio.min)
  assert.equal(clampGrassPlaneSettings({}).edgeDropPosX, 0)
})

test('scenario ground cells carry the drop to every lower neighbour', () => {
  const scenario = generateScenario({ seed: 3, count: 0, radius: 100, relief: 4 })
  const cells = scenario.filter(({ id }) => id.includes('-ground-'))
  const banked = cells.filter(({ grassPlane }) => (grassPlane!.edgeDropPosX + grassPlane!.edgeDropNegX + grassPlane!.edgeDropPosZ + grassPlane!.edgeDropNegZ) > 0)
  assert.ok(banked.length > 0)
  const step = TERRAIN_CELL_SIZE
  banked.forEach(({ position, grassPlane }) => {
    const neighbour = cells.find(({ position: other }) => Math.abs(other[0] - position[0] - step) < 1e-6 && Math.abs(other[2] - position[2]) < 1e-6)
    if (grassPlane!.edgeDropPosX > 0 && neighbour) assert.ok(Math.abs(position[1] - neighbour.position[1] - grassPlane!.edgeDropPosX) < 1e-6)
  })
})

test('village houses keep a wide gap between each other', () => {
  const scenario = generateScenario({ seed: 5, count: 0, radius: 160, villageCount: 3, housesPerVillage: 8 })
  const houses = scenario.filter(({ kind }) => kind === 'house')
  assert.ok(houses.length > 3)
  houses.forEach((house, index) => houses.slice(index + 1).forEach((other) => {
    assert.ok(Math.hypot(house.position[0] - other.position[0], house.position[2] - other.position[2]) >= 18 - 1e-6)
  }))
})
