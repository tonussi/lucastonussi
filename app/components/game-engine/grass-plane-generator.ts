import { createGrassBlade, type GrassBlade } from './grass-generator.ts'
import { between, clampIntegerRange, clampRange, createRandom } from './seeded-random.ts'
import type { GrassPlaneSettings } from './types.ts'

export const GRASS_PLANE_LIMITS = {
  width: { min: 1, max: 600 },
  depth: { min: 1, max: 600 },
  thickness: { min: 0.1, max: 30 },
  bladeCount: { min: 0, max: 20000 },
  bladeHeight: { min: 0.1, max: 2 },
  shapeRandomness: { min: 0, max: 1 },
  edgeDrop: { min: 0, max: 40 },
  rampRunRatio: { min: 0.5, max: 6 },
} as const

export const DEFAULT_GRASS_PLANE_SETTINGS: GrassPlaneSettings = {
  width: 8,
  depth: 8,
  thickness: 0.3,
  bladeCount: 1500,
  bladeHeight: 0.4,
  shapeRandomness: 0.3,
  edgeDropPosX: 0,
  edgeDropNegX: 0,
  edgeDropPosZ: 0,
  edgeDropNegZ: 0,
  rampRunRatio: 2.5,
  seed: 1,
}

const OUTLINE_POINTS = 48
const SHAPE_HARMONICS = [2, 3, 4, 5]
const HARMONIC_AMPLITUDE = 0.22
const HARMONIC_AMPLITUDE_MIN_RATIO = 0.4
const MIN_RADIUS_RATIO = 0.45
const EDGE_MARGIN_RATIO = 1
const MAX_SAMPLING_ATTEMPTS_PER_BLADE = 12
const FULL_TURN = Math.PI * 2
const AXIS_EPSILON = 1e-9
/** Longest horizontal run of a ramp, so it never swallows most of the lower cell. */
const RAMP_MAX_RUN = 10
const RAMP_PROFILE_STEPS = 10
const RAMP_CORNER_STEPS = 6
/** The ramp foot ends this far below the lower ground so the joint never z-fights. */
const RAMP_SINK = 0.05
const AREA_EPSILON = 1e-10

export type EdgeDropKey = 'edgeDropPosX' | 'edgeDropNegX' | 'edgeDropPosZ' | 'edgeDropNegZ'
export const EDGE_DROP_KEYS: EdgeDropKey[] = ['edgeDropPosX', 'edgeDropNegX', 'edgeDropPosZ', 'edgeDropNegZ']

export const rampRun = (drop: number, ratio = DEFAULT_GRASS_PLANE_SETTINGS.rampRunRatio) => Math.min(drop * ratio, RAMP_MAX_RUN)

/** Smootherstep keeps the slope flat where the ramp leaves the upper top and where it meets the lower one. */
const rampProfile = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

export interface GeneratedGrassPlane {
  positions: Float32Array
  indices: Uint32Array
  topVertexCount: number
  blades: GrassBlade[]
  /** Curved banks that join this block to lower neighbours; empty when no edge drops are set. */
  rampPositions: Float32Array
  rampIndices: Uint32Array
}

export function clampGrassPlaneSettings(settings: Partial<GrassPlaneSettings> = {}): GrassPlaneSettings {
  const merged = { ...DEFAULT_GRASS_PLANE_SETTINGS, ...settings }
  const limits = GRASS_PLANE_LIMITS
  return {
    width: clampRange(merged.width, limits.width),
    depth: clampRange(merged.depth, limits.depth),
    thickness: clampRange(merged.thickness, limits.thickness),
    bladeCount: clampIntegerRange(merged.bladeCount, limits.bladeCount),
    bladeHeight: clampRange(merged.bladeHeight, limits.bladeHeight),
    shapeRandomness: clampRange(merged.shapeRandomness, limits.shapeRandomness),
    edgeDropPosX: clampRange(merged.edgeDropPosX, limits.edgeDrop),
    edgeDropNegX: clampRange(merged.edgeDropNegX, limits.edgeDrop),
    edgeDropPosZ: clampRange(merged.edgeDropPosZ, limits.edgeDrop),
    edgeDropNegZ: clampRange(merged.edgeDropNegZ, limits.edgeDrop),
    rampRunRatio: clampRange(merged.rampRunRatio, limits.rampRunRatio),
    seed: Math.round(merged.seed),
  }
}

function rectangleRadius(theta: number, halfWidth: number, halfDepth: number) {
  const cosine = Math.abs(Math.cos(theta))
  const sine = Math.abs(Math.sin(theta))
  return Math.min(
    cosine > AXIS_EPSILON ? halfWidth / cosine : Infinity,
    sine > AXIS_EPSILON ? halfDepth / sine : Infinity,
  )
}

function createBoundary(settings: GrassPlaneSettings, random: () => number) {
  const halfWidth = settings.width / 2
  const halfDepth = settings.depth / 2
  const harmonics = SHAPE_HARMONICS.map((frequency) => ({
    frequency,
    amplitude:
      (between(random, HARMONIC_AMPLITUDE_MIN_RATIO, 1) * settings.shapeRandomness * HARMONIC_AMPLITUDE * 2) /
      frequency,
    phase: between(random, 0, FULL_TURN),
  }))
  return (theta: number) => {
    const distortion = harmonics.reduce(
      (total, { frequency, amplitude, phase }) => total + amplitude * Math.cos(frequency * theta + phase),
      1,
    )
    return rectangleRadius(theta, halfWidth, halfDepth) * Math.max(MIN_RADIUS_RATIO, distortion)
  }
}

function outlineAngles(width: number, depth: number) {
  const corner = Math.atan2(depth / 2, width / 2)
  const uniform = Array.from({ length: OUTLINE_POINTS }, (_, index) => (index / OUTLINE_POINTS) * FULL_TURN)
  return [...uniform, corner, Math.PI - corner, Math.PI + corner, FULL_TURN - corner].sort((a, b) => a - b)
}

interface RampSide {
  drop: number
  run: number
  normal: [number, number]
  tangent: [number, number]
  center: [number, number]
  halfLength: number
}

function rampSides(settings: GrassPlaneSettings): RampSide[] {
  const halfWidth = settings.width / 2
  const halfDepth = settings.depth / 2
  const side = (key: EdgeDropKey, normal: [number, number], halfLength: number): RampSide => ({
    drop: settings[key],
    run: rampRun(settings[key], settings.rampRunRatio),
    normal,
    tangent: [-normal[1], normal[0]],
    center: [normal[0] * halfWidth, normal[1] * halfDepth],
    halfLength,
  })
  return [
    side('edgeDropPosX', [1, 0], halfDepth),
    side('edgeDropNegX', [-1, 0], halfDepth),
    side('edgeDropPosZ', [0, 1], halfWidth),
    side('edgeDropNegZ', [0, -1], halfWidth),
  ]
}

const rampHeight = (drop: number, t: number) => -(drop + RAMP_SINK) * rampProfile(t)

/** Strips along each dropped side plus quarter fans where two dropped sides meet; only for plain rectangles. */
function buildRamps(settings: GrassPlaneSettings) {
  const positions: number[] = []
  const indices: number[] = []
  if (settings.shapeRandomness > 0) return { positions: new Float32Array(), indices: new Uint32Array(), sides: [] as RampSide[] }
  const sides = rampSides(settings).filter(({ drop }) => drop > 0)
  const vertex = (x: number, y: number, z: number) => positions.push(x, y, z) / 3 - 1
  const triangle = (a: number, b: number, c: number) => {
    const ax = positions[a * 3], az = positions[a * 3 + 2]
    const ux = positions[b * 3] - ax, uz = positions[b * 3 + 2] - az
    const vx = positions[c * 3] - ax, vz = positions[c * 3 + 2] - az
    const upward = uz * vx - ux * vz
    if (Math.abs(upward) < AREA_EPSILON) return
    indices.push(...(upward > 0 ? [a, b, c] : [a, c, b]))
  }
  const grid = (columns: number, point: (column: number, step: number) => [number, number, number]) => {
    const first = positions.length / 3
    for (let column = 0; column <= columns; column += 1) {
      for (let step = 0; step <= RAMP_PROFILE_STEPS; step += 1) vertex(...point(column, step))
    }
    const at = (column: number, step: number) => first + column * (RAMP_PROFILE_STEPS + 1) + step
    for (let column = 0; column < columns; column += 1) {
      for (let step = 0; step < RAMP_PROFILE_STEPS; step += 1) {
        triangle(at(column, step), at(column + 1, step), at(column, step + 1))
        triangle(at(column + 1, step), at(column + 1, step + 1), at(column, step + 1))
      }
    }
  }

  sides.forEach(({ drop, run, normal, tangent, center, halfLength }) => grid(1, (column, step) => {
    const t = step / RAMP_PROFILE_STEPS
    const along = column === 0 ? -halfLength : halfLength
    return [center[0] + tangent[0] * along + normal[0] * run * t, rampHeight(drop, t), center[1] + tangent[1] * along + normal[1] * run * t]
  }))

  const xSides = sides.filter(({ normal }) => normal[0] !== 0)
  const zSides = sides.filter(({ normal }) => normal[1] !== 0)
  xSides.forEach((xSide) => zSides.forEach((zSide) => {
    const corner: [number, number] = [xSide.center[0], zSide.center[1]]
    const startAngle = Math.atan2(0, xSide.normal[0])
    const sweep = Math.atan2(zSide.normal[1], 0) - startAngle
    const shortest = Math.atan2(Math.sin(sweep), Math.cos(sweep))
    grid(RAMP_CORNER_STEPS, (column, step) => {
      const blend = column / RAMP_CORNER_STEPS
      const angle = startAngle + shortest * blend
      const drop = xSide.drop + (zSide.drop - xSide.drop) * blend
      const run = xSide.run + (zSide.run - xSide.run) * blend
      const t = step / RAMP_PROFILE_STEPS
      return [corner[0] + Math.cos(angle) * run * t, rampHeight(drop, t), corner[1] + Math.sin(angle) * run * t]
    })
  }))

  return { positions: new Float32Array(positions), indices: new Uint32Array(indices), sides }
}

/** The block's top surface sits at y = 0 and the slab extends downward by `thickness`. */
export function generateGrassPlane(input: Partial<GrassPlaneSettings>): GeneratedGrassPlane {
  const settings = clampGrassPlaneSettings(input)
  const random = createRandom(settings.seed)
  const boundary = createBoundary(settings, random)

  const angles = outlineAngles(settings.width, settings.depth)
  const count = angles.length
  const outline = angles.map((theta) => {
    const radius = boundary(theta)
    return [Math.cos(theta) * radius, Math.sin(theta) * radius] as const
  })

  const positions = new Float32Array((count * 2 + 2) * 3)
  const topCenter = count * 2
  const bottomCenter = count * 2 + 1
  outline.forEach(([x, z], index) => {
    positions.set([x, 0, z], index * 3)
    positions.set([x, -settings.thickness, z], (count + index) * 3)
  })
  positions.set([0, 0, 0], topCenter * 3)
  positions.set([0, -settings.thickness, 0], bottomCenter * 3)

  const indices = new Uint32Array(count * 12)
  outline.forEach((_, index) => {
    const next = (index + 1) % count
    indices.set(
      [
        topCenter, next, index,
        bottomCenter, count + index, count + next,
        index, next, count + index,
        next, count + next, count + index,
      ],
      index * 12,
    )
  })

  const maxX = Math.max(...outline.map(([x]) => Math.abs(x)))
  const maxZ = Math.max(...outline.map(([, z]) => Math.abs(z)))
  const blades: GrassBlade[] = []
  for (let blade = 0; blade < settings.bladeCount; blade += 1) {
    for (let attempt = 0; attempt < MAX_SAMPLING_ATTEMPTS_PER_BLADE; attempt += 1) {
      const x = between(random, -maxX, maxX)
      const z = between(random, -maxZ, maxZ)
      const theta = (Math.atan2(z, x) + FULL_TURN) % FULL_TURN
      if (Math.hypot(x, z) <= boundary(theta) * EDGE_MARGIN_RATIO) {
        blades.push(createGrassBlade(random, x, z, settings.bladeHeight))
        break
      }
    }
  }

  const ramps = buildRamps(settings)
  const density = settings.bladeCount / (settings.width * settings.depth)
  ramps.sides.forEach(({ drop, run, normal, tangent, center, halfLength }) => {
    const rampBlades = Math.round(density * halfLength * 2 * run)
    for (let blade = 0; blade < rampBlades; blade += 1) {
      const along = between(random, -halfLength, halfLength)
      const t = random()
      const grassBlade = createGrassBlade(random, center[0] + tangent[0] * along + normal[0] * run * t, center[1] + tangent[1] * along + normal[1] * run * t, settings.bladeHeight)
      grassBlade.position[1] = rampHeight(drop, t)
      blades.push(grassBlade)
    }
  })

  return { positions, indices, topVertexCount: count, blades, rampPositions: ramps.positions, rampIndices: ramps.indices }
}
