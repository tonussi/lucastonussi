import { DEFAULT_CAVE_SETTINGS, CAVE_LIMITS } from './cave-generator.ts'
import { DEFAULT_GRASS_PLANE_SETTINGS } from './grass-plane-generator.ts'
import { DEFAULT_GRASS_SETTINGS } from './grass-generator.ts'
import { DEFAULT_HOUSE_SETTINGS, HOUSE_LIMITS } from './house-layout.ts'
import { DEFAULT_MOUNTAIN_SETTINGS } from './mountain-generator.ts'
import { clampOceanSettings, DEFAULT_OCEAN_SETTINGS, OCEAN_LIMITS } from './ocean-generator.ts'
import { clampPathSettings, generatePath, PATH_LIMITS } from './path-generator.ts'
import { DEFAULT_ROCK_SETTINGS } from './rock-generator.ts'
import { baseObject, SCENARIO_GENERATED_TAG, isScenarioObject } from './scenario-objects.ts'
import { buildSeamRocks, buildStepStones } from './scenario-rocks.ts'
import { between, clampIntegerRange, clampRange, createRandom } from './seeded-random.ts'
import { buildTerrain, TERRAIN_CELL_SIZE, type FlatZone, type Terrain } from './terrain-grid.ts'
import { DEFAULT_TREE_SETTINGS } from './tree-generator.ts'
import { DEFAULT_WATER_SETTINGS, generateWater, LAKE_MAX_RADIUS_RATIO, WATER_LIMITS } from './water-generator.ts'
import type { EngineSceneObject, ProceduralSettings } from './types.ts'

export { SCENARIO_GENERATED_TAG, isScenarioObject }

export const SCENARIO_LIMITS = {
  count: { min: 0, max: 300 },
  radius: { min: 30, max: 160 },
  pathCount: { min: 0, max: 8 },
  lakeCount: { min: 0, max: 8 },
  riverCount: { min: 0, max: 4 },
  relief: { min: 0, max: 6 },
} as const

export const PRESERVED_KINDS: EngineSceneObject['kind'][] = ['character', 'light']

const GROUND_LEVEL = 0
const SPAWN_GROUND_DROP = 0.5
const LAND_LENGTH_RATIO = 1.4
const LAND_WIDTH_RATIO = 0.8
const GROUND_BLADES_PER_CELL = 140
const CLIFF_EXTRA_DEPTH = 1
const FOOTPRINT_SAMPLE_RATIO = 0.6
const FLAT_ZONE_CELL_RATIO = 0.75
const GROUND_COLOR = '#4f8f3a'
const SAND_COLOR = '#e2c488'
const DESERT_DEPTH_RATIO = 1.2
const DESERT_MIN_DEPTH = 120
const DESERT_OVERLAP_CELLS = 3
const DESERT_SIDE_MARGIN = 60
const SAND_SINK = 0.1
const BIG_MOUNTAIN = { radius: 55, height: 90, snowLine: 0.62, color: '#c9a96e' }
const PATH_COLOR = '#8a7152'
const PATH_WIDTH_RANGE = { min: PATH_LIMITS.width.min * 2, max: PATH_LIMITS.width.max * 0.6 }
const PATH_AXIS_LENGTH_RATIO = 0.9
const PATH_CROSS_LENGTH_RATIO = 0.8
const PATH_CROSS_JITTER = 0.7
const WATER_COLOR = '#2f7fb8'
const WATER_MARGIN = 1.5
const WATER_SPACING = 14
const LAKE_RADIUS_RANGE = { min: 5, max: 12 }
const RIVER_WIDTH_RANGE = { min: 3, max: 5 }
const RIVER_LENGTH_RATIO = 1.9
const RIVER_HEADING_JITTER = 0.2
const MAX_WATER_ATTEMPTS = 30
const SPAWN_CLEARANCE = 4
const PATH_MARGIN = 1
const MAX_PLACEMENT_ATTEMPTS = 20
const MAX_BIG_PROPS = { cave: 4, house: 8 } as const
const SMALL_GRASS_BLADES = 200
const MOUND_RADIUS_RANGE = { min: 4, max: 9 }
const MOUND_HEIGHT_RANGE = { min: 1.2, max: 3 }
const MOUND_FOOTPRINT_RATIO = 0.6
const TREE_STRIP_SPACING = 7
const TREE_STRIP_ROWS = 2
const TREE_STRIP_OFFSET_CELLS = 0.8
const TREE_STRIP_JITTER = 3
const TREE_STRIP_HEIGHT_RANGE = { min: 5, max: 10 }
const HORIZON_RANGE_COUNT = 3
const HORIZON_MOUNTAINS_PER_RANGE = { min: 3, max: 5 }
const HORIZON_RADIUS_RANGE = { min: 30, max: 60 }
const HORIZON_HEIGHT_RANGE = { min: 50, max: 110 }
const HORIZON_DISTANCE_RATIO = 2.6
const HORIZON_DISTANCE_SPREAD = 0.5
const HORIZON_MIN_DISTANCE = 220
const HORIZON_ARC_HALF_WIDTH = { min: 0.15, max: 0.3 }
const HORIZON_SINK = 30
const OCEAN_DEPTH = 2
const OCEAN_COLOR = '#064b70'
const OCEAN_CENTER_RATIO = 0.35
const SHIP_COUNT = 4
const SHIP_SCALE = 6
const SHIP_WATER_OFFSET = 1.25
const SHIP_SEA_OFFSET_CELLS = 3
const SHIP_SIDE_RATIO = 0.8
const SHIP_FAR_RATIO = 0.85
const SHIP_ATTEMPTS = 20
const FOG_NEAR_RATIO = 1
const FOG_FAR_RATIO = 5

type PropKind = 'rock' | 'tree' | 'grass' | 'mound' | 'cave' | 'house'

const PROP_WEIGHTS: [PropKind, number][] = [
  ['rock', 0.2],
  ['tree', 0.22],
  ['grass', 0.2],
  ['mound', 0.16],
  ['house', 0.12],
  ['cave', 0.1],
]

const PROP_COLORS: Record<PropKind, string> = {
  rock: '#8b8780',
  tree: '#4f9a45',
  grass: '#5fae3e',
  mound: '#5a9b43',
  cave: '#6f6a64',
  house: '#d9c7a3',
}

const PROP_LABELS: Record<PropKind, string> = {
  rock: 'Rock',
  tree: 'Tree',
  grass: 'Grass',
  mound: 'Mound',
  cave: 'Cave',
  house: 'House',
}

type Polyline = { points: [number, number][]; reach: number }

export function clampProceduralSettings(settings: Partial<ProceduralSettings> = {}): ProceduralSettings {
  return {
    seed: Math.round(Number.isFinite(settings.seed) ? (settings.seed as number) : 1),
    count: clampIntegerRange(settings.count ?? 120, SCENARIO_LIMITS.count),
    radius: clampRange(settings.radius ?? 100, SCENARIO_LIMITS.radius),
    pathCount: clampIntegerRange(settings.pathCount ?? 3, SCENARIO_LIMITS.pathCount),
    lakeCount: clampIntegerRange(settings.lakeCount ?? 2, SCENARIO_LIMITS.lakeCount),
    riverCount: clampIntegerRange(settings.riverCount ?? 2, SCENARIO_LIMITS.riverCount),
    relief: clampIntegerRange(settings.relief ?? 3, SCENARIO_LIMITS.relief),
  }
}

export function scenarioDimensions(radius: number) {
  return { halfLength: radius * LAND_LENGTH_RATIO, halfWidth: radius * LAND_WIDTH_RATIO }
}

function pickProp(random: () => number): PropKind {
  let roll = random()
  for (const [kind, weight] of PROP_WEIGHTS) {
    roll -= weight
    if (roll <= 0) return kind
  }
  return 'rock'
}

const toWorld = (points: [number, number][], heading: number, origin: [number, number]): [number, number][] => {
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  return points.map(([x, z]) => [origin[0] + x * cos + z * sin, origin[1] - x * sin + z * cos])
}

function buildPaths(prefix: string, settings: ProceduralSettings, random: () => number) {
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  const objects: EngineSceneObject[] = []
  const lines: Polyline[] = []

  for (let index = 0; index < settings.pathCount; index += 1) {
    const alongAxis = index < 2
    const heading = alongAxis
      ? (index === 0 ? 1 : -1) * (Math.PI / 2) + between(random, -0.15, 0.15)
      : (index % 2 === 0 ? 0 : Math.PI) + between(random, -PATH_CROSS_JITTER, PATH_CROSS_JITTER)
    const pathSettings = clampPathSettings({
      length: alongAxis ? halfLength * PATH_AXIS_LENGTH_RATIO : halfWidth * PATH_CROSS_LENGTH_RATIO,
      width: between(random, PATH_WIDTH_RANGE.min, PATH_WIDTH_RANGE.max),
      wiggle: random(),
      seed: Math.floor(random() * 1e6),
    })
    objects.push({
      ...baseObject(`${prefix}-path-${index}`, `Path ${index + 1}`, 'path', PATH_COLOR, [0, GROUND_LEVEL, 0], heading),
      path: pathSettings,
    })
    lines.push({ points: toWorld(generatePath(pathSettings).centerline, heading, [0, 0]), reach: pathSettings.width / 2 })
  }
  return { objects, lines }
}

function buildWater(prefix: string, settings: ProceduralSettings, random: () => number) {
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  const objects: EngineSceneObject[] = []
  const shapes: Polyline[] = []
  const kinds = [
    ...Array.from({ length: settings.riverCount }, () => 'river' as const),
    ...Array.from({ length: settings.lakeCount }, () => 'lake' as const),
  ]

  kinds.forEach((shape, index) => {
    const width = between(random, RIVER_WIDTH_RANGE.min, RIVER_WIDTH_RANGE.max)
    const waterSettings = {
      ...DEFAULT_WATER_SETTINGS,
      shape,
      size: shape === 'lake' ? between(random, LAKE_RADIUS_RANGE.min, LAKE_RADIUS_RANGE.max) : Math.min(halfWidth * RIVER_LENGTH_RATIO, WATER_LIMITS.size.max),
      width,
      wiggle: random(),
      seed: Math.floor(random() * 1e6),
    }
    const reach = shape === 'lake' ? waterSettings.size * LAKE_MAX_RADIUS_RATIO : width / 2

    for (let attempt = 0; attempt < MAX_WATER_ATTEMPTS; attempt += 1) {
      const heading = shape === 'river' ? between(random, -RIVER_HEADING_JITTER, RIVER_HEADING_JITTER) : 0
      const x = between(random, -halfLength * 0.85, halfLength * 0.85)
      const z = shape === 'river' ? -halfWidth + TERRAIN_CELL_SIZE : between(random, -halfWidth * 0.6, halfWidth * 0.6)
      const points: [number, number][] = shape === 'lake' ? [[x, z]] : toWorld(generateWater(waterSettings).outline, heading, [x, z])
      const awayFromSpawn = points.every(([px, pz]) => Math.hypot(px, pz) > SPAWN_CLEARANCE + reach + TERRAIN_CELL_SIZE)
      const apartFromWater = shapes.every((other) =>
        other.points.every(([ox, oz]) => points.every(([px, pz]) => Math.hypot(ox - px, oz - pz) > other.reach + reach + WATER_SPACING)),
      )
      if (!awayFromSpawn || !apartFromWater) continue
      shapes.push({ points, reach })
      objects.push({
        ...baseObject(`${prefix}-water-${index}`, `${shape === 'lake' ? 'Lake' : 'River'} ${index + 1}`, 'water', WATER_COLOR, [x, GROUND_LEVEL, z], heading),
        water: waterSettings,
      })
      break
    }
  })
  return { objects, shapes }
}

function flatZonesFrom(lines: Polyline[]): FlatZone[] {
  const cellReach = TERRAIN_CELL_SIZE * FLAT_ZONE_CELL_RATIO
  return [
    { x: 0, z: 0, reach: cellReach + SPAWN_CLEARANCE },
    ...lines.flatMap(({ points, reach }) => points.map(([x, z]) => ({ x, z, reach: reach + cellReach }))),
  ]
}

function buildGround(prefix: string, terrain: Terrain): EngineSceneObject[] {
  const oceanY = GROUND_LEVEL - OCEAN_DEPTH
  return terrain.cells.map(({ x, z, top }, index) => ({
    ...baseObject(`${prefix}-ground-${index}`, `Ground ${index + 1}`, 'grass-plane', GROUND_COLOR, [x, top, z], 0),
    grassPlane: {
      ...DEFAULT_GRASS_PLANE_SETTINGS,
      width: TERRAIN_CELL_SIZE,
      depth: TERRAIN_CELL_SIZE,
      thickness: top - oceanY + CLIFF_EXTRA_DEPTH,
      bladeCount: GROUND_BLADES_PER_CELL,
      shapeRandomness: 0,
      seed: index + 1,
    },
  }))
}

function buildDesert(prefix: string, settings: ProceduralSettings, random: () => number): EngineSceneObject[] {
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  const depth = Math.max(DESERT_MIN_DEPTH, settings.radius * DESERT_DEPTH_RATIO)
  const overlap = TERRAIN_CELL_SIZE * DESERT_OVERLAP_CELLS
  const oceanY = GROUND_LEVEL - OCEAN_DEPTH
  const sand: EngineSceneObject = {
    ...baseObject(`${prefix}-desert`, 'Desert', 'grass-plane', SAND_COLOR, [0, GROUND_LEVEL - SAND_SINK, -halfWidth + overlap - (depth + overlap) / 2], 0),
    grassPlane: {
      ...DEFAULT_GRASS_PLANE_SETTINGS,
      width: (halfLength + DESERT_SIDE_MARGIN) * 2,
      depth: depth + overlap,
      thickness: GROUND_LEVEL - SAND_SINK - oceanY + CLIFF_EXTRA_DEPTH,
      bladeCount: 0,
      shapeRandomness: 0,
      seed: 1,
    },
  }
  const mountain: EngineSceneObject = {
    ...baseObject(`${prefix}-big-mountain`, 'Big Mountain', 'mountain', BIG_MOUNTAIN.color, [between(random, -halfLength * 0.5, halfLength * 0.5), GROUND_LEVEL, -halfWidth - depth * 0.55], random() * Math.PI * 2),
    mountain: { ...DEFAULT_MOUNTAIN_SETTINGS, radius: BIG_MOUNTAIN.radius, height: BIG_MOUNTAIN.height, peakCount: 3, roughness: 0.35, snowLine: BIG_MOUNTAIN.snowLine, seed: Math.floor(random() * 1e6) },
  }
  return [sand, mountain]
}

function buildProp(prefix: string, index: number, kind: PropKind, random: () => number) {
  const seed = Math.floor(random() * 1e6)
  const id = `${prefix}-${kind}-${index}`
  const name = `${PROP_LABELS[kind]} ${index + 1}`
  const rotationY = random() * Math.PI * 2
  const make = (position: [number, number, number]) =>
    baseObject(id, name, kind === 'mound' ? 'mountain' : kind, PROP_COLORS[kind], position, rotationY)

  if (kind === 'rock') {
    const size = between(random, 1, 2.5)
    return { footprint: size, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), rock: { ...DEFAULT_ROCK_SETTINGS, size, roughness: between(random, 0.15, 0.5), flatness: between(random, 0.5, 0.9), elongation: between(random, 1, 1.6), seed } }) }
  }
  if (kind === 'tree') {
    const height = between(random, 3, 9)
    return { footprint: 1.5, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), tree: { ...DEFAULT_TREE_SETTINGS, height, seed } }) }
  }
  if (kind === 'grass') {
    const width = between(random, 2, 5)
    return { footprint: 0, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), grass: { ...DEFAULT_GRASS_SETTINGS, bladeCount: SMALL_GRASS_BLADES, width, depth: width, seed } }) }
  }
  if (kind === 'mound') {
    const radius = between(random, MOUND_RADIUS_RANGE.min, MOUND_RADIUS_RANGE.max)
    return { footprint: radius * MOUND_FOOTPRINT_RATIO, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), mountain: { ...DEFAULT_MOUNTAIN_SETTINGS, radius, height: between(random, MOUND_HEIGHT_RANGE.min, MOUND_HEIGHT_RANGE.max), peakCount: 1, roughness: 0.15, snowLine: 1, seed } }) }
  }
  if (kind === 'cave') {
    const radius = between(random, CAVE_LIMITS.radius.min + 1, CAVE_LIMITS.radius.max)
    return { footprint: radius * 2, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), cave: { ...DEFAULT_CAVE_SETTINGS, radius, seed } }) }
  }
  const width = between(random, HOUSE_LIMITS.width.min + 1, 10)
  const depth = between(random, HOUSE_LIMITS.depth.min + 1, 10)
  return { footprint: Math.max(width, depth) / 2 + 1, create: (x: number, z: number, y: number) => ({ ...make([x, y, z]), house: { ...DEFAULT_HOUSE_SETTINGS, width, depth } }) }
}

function buildHorizon(prefix: string, settings: ProceduralSettings, random: () => number): EngineSceneObject[] {
  const baseDistance = Math.max(HORIZON_MIN_DISTANCE, settings.radius * HORIZON_DISTANCE_RATIO)
  const rangeSpacing = (Math.PI * 2) / HORIZON_RANGE_COUNT
  const firstAngle = random() * Math.PI * 2
  const mountains: EngineSceneObject[] = []

  for (let range = 0; range < HORIZON_RANGE_COUNT; range += 1) {
    const centerAngle = firstAngle + range * rangeSpacing + between(random, -rangeSpacing * 0.2, rangeSpacing * 0.2)
    const halfWidth = between(random, HORIZON_ARC_HALF_WIDTH.min, HORIZON_ARC_HALF_WIDTH.max)
    const count = HORIZON_MOUNTAINS_PER_RANGE.min + Math.floor(random() * (HORIZON_MOUNTAINS_PER_RANGE.max - HORIZON_MOUNTAINS_PER_RANGE.min + 1))
    for (let index = 0; index < count; index += 1) {
      const angle = centerAngle + between(random, -halfWidth, halfWidth)
      const distance = baseDistance * (1 + between(random, 0, HORIZON_DISTANCE_SPREAD))
      const radius = between(random, HORIZON_RADIUS_RANGE.min, HORIZON_RADIUS_RANGE.max)
      const id = mountains.length
      mountains.push({
        ...baseObject(`${prefix}-horizon-${id}`, `Horizon Mountain ${id + 1}`, 'mountain', '#7b736a', [Math.cos(angle) * distance, GROUND_LEVEL - HORIZON_SINK, Math.sin(angle) * distance], random() * Math.PI * 2),
        mountain: { ...DEFAULT_MOUNTAIN_SETTINGS, radius, height: between(random, HORIZON_HEIGHT_RANGE.min, HORIZON_HEIGHT_RANGE.max) + HORIZON_SINK, peakCount: 2 + Math.floor(random() * 3), roughness: 0.5, snowLine: 0.7, seed: Math.floor(random() * 1e6) },
      })
    }
  }
  return mountains
}

function buildOceanAndShips(prefix: string, terrain: Terrain, random: () => number): EngineSceneObject[] {
  const oceanY = GROUND_LEVEL - OCEAN_DEPTH
  const size = OCEAN_LIMITS.segments.max * (DEFAULT_OCEAN_SETTINGS.size / DEFAULT_OCEAN_SETTINGS.segments)
  const centerZ = terrain.halfWidth + size * OCEAN_CENTER_RATIO
  const ocean: EngineSceneObject = {
    ...baseObject(`${prefix}-ocean`, 'Ocean', 'ocean', OCEAN_COLOR, [0, oceanY, centerZ], 0),
    ocean: clampOceanSettings({ ...DEFAULT_OCEAN_SETTINGS, size, segments: OCEAN_LIMITS.segments.max, seed: Math.floor(random() * 1e6) }),
  }

  const ships: EngineSceneObject[] = []
  for (let index = 0; index < SHIP_COUNT; index += 1) {
    for (let attempt = 0; attempt < SHIP_ATTEMPTS; attempt += 1) {
      const x = between(random, -size / 2, size / 2) * SHIP_SIDE_RATIO
      const z = between(random, terrain.halfWidth + TERRAIN_CELL_SIZE * SHIP_SEA_OFFSET_CELLS, centerZ + (size / 2) * SHIP_FAR_RATIO)
      const nearLand = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => terrain.heightAt(x + dx * TERRAIN_CELL_SIZE, z + dz * TERRAIN_CELL_SIZE) !== undefined)
      if (nearLand) continue
      ships.push({
        ...baseObject(`${prefix}-ship-${index}`, `Ship ${index + 1}`, 'model', '#ffffff', [x, oceanY + SHIP_WATER_OFFSET, z], random() * Math.PI * 2),
        scale: [SHIP_SCALE, SHIP_SCALE, SHIP_SCALE],
        model: { modelId: 'pirate-ship', collider: 'none' },
      })
      break
    }
  }
  return [ocean, ...ships]
}

function buildTreeStrip(
  prefix: string,
  terrain: Terrain,
  settings: ProceduralSettings,
  isClear: (x: number, z: number) => boolean,
  random: () => number,
): EngineSceneObject[] {
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  const trees: EngineSceneObject[] = []
  for (let row = 0; row < TREE_STRIP_ROWS; row += 1) {
    for (let x = -halfLength; x <= halfLength; x += TREE_STRIP_SPACING) {
      const treeX = x + between(random, -TREE_STRIP_JITTER, TREE_STRIP_JITTER)
      const treeZ = -halfWidth + TERRAIN_CELL_SIZE * (TREE_STRIP_OFFSET_CELLS + row * 0.5) + between(random, -TREE_STRIP_JITTER, TREE_STRIP_JITTER)
      const height = terrain.heightAt(treeX, treeZ)
      if (height === undefined || !isClear(treeX, treeZ)) continue
      trees.push({
        ...baseObject(`${prefix}-strip-tree-${trees.length}`, `Forest Tree ${trees.length + 1}`, 'tree', PROP_COLORS.tree, [treeX, height, treeZ], random() * Math.PI * 2),
        tree: { ...DEFAULT_TREE_SETTINGS, height: between(random, TREE_STRIP_HEIGHT_RANGE.min, TREE_STRIP_HEIGHT_RANGE.max), seed: Math.floor(random() * 1e6) },
      })
    }
  }
  return trees
}

export function scenarioFog(settings: Partial<ProceduralSettings>) {
  const { radius } = clampProceduralSettings(settings)
  return { fogNear: radius * FOG_NEAR_RATIO, fogFar: radius * FOG_FAR_RATIO }
}

export function replaceWithScenario(
  sceneObjects: EngineSceneObject[],
  settings: Partial<ProceduralSettings>,
): EngineSceneObject[] {
  const preserved = sceneObjects.filter(({ kind }) => PRESERVED_KINDS.includes(kind))
  const spawn = preserved.find(({ kind }) => kind === 'character')?.position
  return [...preserved, ...generateScenario(settings, spawn)]
}

export function generateScenario(
  input: Partial<ProceduralSettings>,
  spawn: [number, number, number] = [0, 0, 0],
): EngineSceneObject[] {
  const settings = clampProceduralSettings(input)
  const random = createRandom(settings.seed)
  const prefix = `scenario-${settings.seed}`
  const { halfLength, halfWidth } = scenarioDimensions(settings.radius)
  const { objects: paths, lines } = buildPaths(prefix, settings, random)
  const { objects: water, shapes: waterShapes } = buildWater(prefix, settings, random)

  const nearest = (polylines: Polyline[], x: number, z: number) =>
    polylines.reduce(
      (best, { points, reach }) => Math.min(best, ...points.map(([px, pz]) => Math.hypot(px - x, pz - z) - reach)),
      Infinity,
    )

  const terrain = buildTerrain({
    halfLength,
    halfWidth,
    relief: settings.relief,
    seed: settings.seed,
    flatZones: flatZonesFrom([...lines, ...waterShapes]),
  })

  const levelHeightAt = (x: number, z: number, footprint: number) => {
    const reach = footprint * FOOTPRINT_SAMPLE_RATIO
    const heights = [[0, 0], [reach, 0], [-reach, 0], [0, reach], [0, -reach]].map(([dx, dz]) => terrain.heightAt(x + dx, z + dz))
    return heights.every((height) => height !== undefined && height === heights[0]) ? heights[0] : undefined
  }

  const placements: { x: number; z: number; radius: number }[] = []
  const bigCounts = { cave: 0, house: 0 }
  const props: EngineSceneObject[] = []

  Array.from({ length: settings.count }, () => pickProp(random)).forEach((kind, index) => {
    if (kind in bigCounts && bigCounts[kind as keyof typeof bigCounts] >= MAX_BIG_PROPS[kind as keyof typeof MAX_BIG_PROPS]) return
    const prop = buildProp(prefix, index, kind, random)

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
      const x = between(random, -halfLength, halfLength)
      const z = between(random, -halfWidth, halfWidth)
      if (Math.hypot(x, z) < SPAWN_CLEARANCE + prop.footprint) continue
      const clearOfPath = kind === 'grass' || nearest(lines, x, z) > prop.footprint + PATH_MARGIN
      const clearOfWater = nearest(waterShapes, x, z) > prop.footprint + WATER_MARGIN
      const height = levelHeightAt(x, z, prop.footprint)
      const clearOfProps = placements.every((placed) => Math.hypot(placed.x - x, placed.z - z) > placed.radius + prop.footprint)
      if (height === undefined || !clearOfPath || !clearOfWater || !clearOfProps) continue
      placements.push({ x, z, radius: prop.footprint })
      props.push(prop.create(x, z, height))
      if (kind in bigCounts) bigCounts[kind as keyof typeof bigCounts] += 1
      break
    }
  })

  const isClear = (x: number, z: number) => nearest(lines, x, z) > PATH_MARGIN && nearest(waterShapes, x, z) > WATER_MARGIN
  const oceanY = GROUND_LEVEL - OCEAN_DEPTH
  const origin: [number, number, number] = [spawn[0], spawn[1] - SPAWN_GROUND_DROP, spawn[2]]
  const objects = [
    ...buildGround(prefix, terrain),
    ...buildDesert(prefix, settings, random),
    ...buildTreeStrip(prefix, terrain, settings, isClear, random),
    ...buildSeamRocks(prefix, terrain, oceanY, random),
    ...buildStepStones(prefix, terrain, oceanY, random),
    ...paths,
    ...water,
    ...props,
    ...buildHorizon(prefix, settings, random),
    ...buildOceanAndShips(prefix, terrain, random),
  ]
  return objects.map((object) => ({
    ...object,
    position: [object.position[0] + origin[0], object.position[1] + origin[1], object.position[2] + origin[2]],
  }))
}
