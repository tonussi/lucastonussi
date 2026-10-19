import { between, clampIntegerRange, clampRange, createRandom } from './seeded-random.ts'
import type { GrassSettings } from './types.ts'

export const GRASS_LIMITS = {
  bladeCount: { min: 3, max: 20000 },
  height: { min: 0.1, max: 2 },
  width: { min: 0.1, max: 60 },
  depth: { min: 0.1, max: 60 },
} as const

export const DEFAULT_GRASS_SETTINGS: GrassSettings = {
  bladeCount: 20,
  height: 0.5,
  width: 0.4,
  depth: 0.4,
  seed: 1,
}

const HEIGHT_VARIATION = 0.35
const BLADE_WIDTH_RATIO = 0.3
const MAX_LEAN = 0.5
const MIN_SHADE = 0.75
const MAX_SHADE = 1.2

export interface GrassBlade {
  position: [number, number, number]
  height: number
  width: number
  yaw: number
  lean: number
  shade: number
}

export function clampGrassSettings(settings: Partial<GrassSettings> = {}): GrassSettings {
  const merged = { ...DEFAULT_GRASS_SETTINGS, ...settings }
  return {
    bladeCount: clampIntegerRange(merged.bladeCount, GRASS_LIMITS.bladeCount),
    height: clampRange(merged.height, GRASS_LIMITS.height),
    width: clampRange(merged.width, GRASS_LIMITS.width),
    depth: clampRange(merged.depth, GRASS_LIMITS.depth),
    seed: Math.round(merged.seed),
  }
}

export function createGrassBlade(
  random: () => number,
  x: number,
  z: number,
  baseHeight: number,
): GrassBlade {
  const bladeHeight = baseHeight * between(random, 1 - HEIGHT_VARIATION, 1 + HEIGHT_VARIATION)
  return {
    position: [x, 0, z],
    height: bladeHeight,
    width: Math.max(bladeHeight * BLADE_WIDTH_RATIO, 0.01),
    yaw: between(random, 0, Math.PI * 2),
    lean: MAX_LEAN * random(),
    shade: between(random, MIN_SHADE, MAX_SHADE),
  }
}

export function generateGrass(input: Partial<GrassSettings>): GrassBlade[] {
  const { bladeCount, height, width, depth, seed } = clampGrassSettings(input)
  const random = createRandom(seed)
  return Array.from({ length: bladeCount }, () =>
    createGrassBlade(random, between(random, -width / 2, width / 2), between(random, -depth / 2, depth / 2), height),
  )
}
