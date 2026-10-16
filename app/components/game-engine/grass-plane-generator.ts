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
} as const

export const DEFAULT_GRASS_PLANE_SETTINGS: GrassPlaneSettings = {
  width: 8,
  depth: 8,
  thickness: 0.3,
  bladeCount: 1500,
  bladeHeight: 0.4,
  shapeRandomness: 0.3,
  seed: 1,
}

const OUTLINE_POINTS = 48
const SHAPE_HARMONICS = [2, 3, 4, 5]
const HARMONIC_AMPLITUDE = 0.22
const HARMONIC_AMPLITUDE_MIN_RATIO = 0.4
const MIN_RADIUS_RATIO = 0.45
const EDGE_MARGIN_RATIO = 0.96
const MAX_SAMPLING_ATTEMPTS_PER_BLADE = 12
const FULL_TURN = Math.PI * 2
const AXIS_EPSILON = 1e-9

export interface GeneratedGrassPlane {
  positions: Float32Array
  indices: Uint32Array
  topVertexCount: number
  blades: GrassBlade[]
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

  return { positions, indices, topVertexCount: count, blades }
}
