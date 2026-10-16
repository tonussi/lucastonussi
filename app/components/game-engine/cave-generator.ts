import { between, clampRange, createRandom } from './seeded-random.ts'
import type { CaveSettings } from './types.ts'

export const CAVE_LIMITS = {
  radius: { min: 1.5, max: 8 },
  depth: { min: 3, max: 24 },
} as const

export const DEFAULT_CAVE_SETTINGS: CaveSettings = {
  radius: 3,
  depth: 8,
  seed: 1,
}

const ROCK_SIZE_RATIO = 0.4
const SLICE_SPACING_RATIO = 0.55
const ARC_ROCK_COUNT = 11
const BACK_WALL_RING_FRACTIONS = [0.35, 0.7, 1] as const
const BACK_WALL_RING_ROCKS = [3, 7, ARC_ROCK_COUNT] as const
const POSITION_JITTER_RATIO = 0.25
const SIZE_VARIATION = 0.35
const CLEARANCE_RATIO = 0.85
const COLLIDER_THICKNESS = 0.6

export type Vec3 = [number, number, number]

export interface CaveRock {
  position: Vec3
  rotation: Vec3
  scale: Vec3
}

export interface CaveCollider {
  position: Vec3
  halfExtents: Vec3
}

export interface GeneratedCave {
  rocks: CaveRock[]
  colliders: CaveCollider[]
}

export function clampCaveSettings(settings: Partial<CaveSettings> = {}): CaveSettings {
  const merged = { ...DEFAULT_CAVE_SETTINGS, ...settings }
  return {
    radius: clampRange(merged.radius, CAVE_LIMITS.radius),
    depth: clampRange(merged.depth, CAVE_LIMITS.depth),
    seed: Math.round(merged.seed),
  }
}

export function generateCave(input: Partial<CaveSettings>): GeneratedCave {
  const { radius, depth, seed } = clampCaveSettings(input)
  const random = createRandom(seed)
  const rockSize = radius * ROCK_SIZE_RATIO
  const jitter = rockSize * POSITION_JITTER_RATIO
  const rocks: CaveRock[] = []

  const addRock = (x: number, y: number, z: number) => {
    const size = rockSize * between(random, 1 - SIZE_VARIATION, 1 + SIZE_VARIATION)
    rocks.push({
      position: [x + between(random, -jitter, jitter), Math.max(0, y), z + between(random, -jitter, jitter)],
      rotation: [between(random, 0, Math.PI), between(random, 0, Math.PI), between(random, 0, Math.PI)],
      scale: [size, size * between(random, 0.8, 1.1), size],
    })
  }

  const sliceCount = Math.ceil(depth / (radius * SLICE_SPACING_RATIO))
  const sliceSpacing = depth / sliceCount
  for (let slice = 0; slice <= sliceCount; slice += 1) {
    for (let index = 0; index < ARC_ROCK_COUNT; index += 1) {
      const angle = (index / (ARC_ROCK_COUNT - 1)) * Math.PI
      addRock(Math.cos(angle) * radius, Math.sin(angle) * radius, -slice * sliceSpacing)
    }
  }

  BACK_WALL_RING_FRACTIONS.forEach((fraction, ringIndex) => {
    const rockCount = BACK_WALL_RING_ROCKS[ringIndex]
    for (let index = 0; index < rockCount; index += 1) {
      const angle = (index / (rockCount - 1)) * Math.PI
      addRock(Math.cos(angle) * radius * fraction, Math.sin(angle) * radius * fraction, -depth)
    }
  })

  const clearance = radius * CLEARANCE_RATIO
  const halfDepth = depth / 2
  const half = COLLIDER_THICKNESS / 2
  const colliders: CaveCollider[] = [
    { position: [-(clearance + half), radius / 2, -halfDepth], halfExtents: [half, radius / 2, halfDepth] },
    { position: [clearance + half, radius / 2, -halfDepth], halfExtents: [half, radius / 2, halfDepth] },
    { position: [0, clearance + half, -halfDepth], halfExtents: [clearance + COLLIDER_THICKNESS, half, halfDepth] },
    { position: [0, radius / 2, -depth - half], halfExtents: [clearance + COLLIDER_THICKNESS, radius / 2 + half, half] },
  ]

  return { rocks, colliders }
}
