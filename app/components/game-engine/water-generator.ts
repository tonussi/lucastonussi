import { generatePath, PATH_STEP } from './path-generator.ts'
import { clampRange, createRandom } from './seeded-random.ts'
import type { WaterSettings } from './types.ts'

export const WATER_SHAPES = ['lake', 'river'] as const

export const WATER_LIMITS = {
  size: { min: 3, max: 200 },
  width: { min: 2, max: 20 },
  wiggle: { min: 0, max: 1 },
} as const

export const DEFAULT_WATER_SETTINGS: WaterSettings = {
  shape: 'lake',
  size: 10,
  width: 6,
  wiggle: 0.5,
  seed: 1,
}

export const WATER_HEIGHT = 0.06
const LAKE_OUTLINE_POINTS = 40
const LAKE_HARMONICS = [2, 3, 5]
const LAKE_HARMONIC_AMPLITUDE = 0.18
export const LAKE_MAX_RADIUS_RATIO = 1 + LAKE_HARMONICS.length * LAKE_HARMONIC_AMPLITUDE

export type WaterPoint = [number, number]

export interface GeneratedWater {
  positions: Float32Array
  indices: Uint32Array
  /** Lake: closed outline. River: centerline. Both in local XZ space. */
  outline: WaterPoint[]
}

export function clampWaterSettings(settings: Partial<WaterSettings> = {}): WaterSettings {
  const merged = { ...DEFAULT_WATER_SETTINGS, ...settings }
  return {
    shape: WATER_SHAPES.includes(merged.shape) ? merged.shape : DEFAULT_WATER_SETTINGS.shape,
    size: clampRange(merged.size, WATER_LIMITS.size),
    width: clampRange(merged.width, WATER_LIMITS.width),
    wiggle: clampRange(merged.wiggle, WATER_LIMITS.wiggle),
    seed: Math.round(merged.seed),
  }
}

function generateLake({ size, seed }: WaterSettings): GeneratedWater {
  const random = createRandom(seed)
  const harmonics = LAKE_HARMONICS.map((frequency) => ({
    frequency,
    amplitude: LAKE_HARMONIC_AMPLITUDE * (0.4 + random() * 0.6),
    phase: random() * Math.PI * 2,
  }))
  const outline: WaterPoint[] = Array.from({ length: LAKE_OUTLINE_POINTS }, (_, index) => {
    const theta = (index / LAKE_OUTLINE_POINTS) * Math.PI * 2
    const radius = size * (1 + harmonics.reduce((total, { frequency, amplitude, phase }) => total + amplitude * Math.cos(frequency * theta + phase), 0) * 0.5)
    return [Math.cos(theta) * radius, Math.sin(theta) * radius]
  })

  const positions = new Float32Array((outline.length + 1) * 3)
  outline.forEach(([x, z], index) => positions.set([x, WATER_HEIGHT, z], (index + 1) * 3))
  positions.set([0, WATER_HEIGHT, 0], 0)
  const indices = new Uint32Array(outline.length * 3)
  outline.forEach((_, index) => {
    const next = (index + 1) % outline.length
    indices.set([0, next + 1, index + 1], index * 3)
  })
  return { positions, indices, outline }
}

function generateRiver({ size, width, wiggle, seed }: WaterSettings): GeneratedWater {
  const { positions, indices, centerline } = generatePath({ length: Math.max(size, PATH_STEP * 3), width, wiggle, seed })
  const raised = new Float32Array(positions)
  for (let index = 1; index < raised.length; index += 3) raised[index] = WATER_HEIGHT
  return { positions: raised, indices, outline: centerline }
}

export function generateWater(input: Partial<WaterSettings>): GeneratedWater {
  const settings = clampWaterSettings(input)
  return settings.shape === 'lake' ? generateLake(settings) : generateRiver(settings)
}
