import { between, clampIntegerRange, clampRange, createRandom } from './seeded-random.ts'
import type { MountainSettings } from './types.ts'

export const MOUNTAIN_LIMITS = {
  height: { min: 1, max: 140 },
  radius: { min: 4, max: 70 },
  peakCount: { min: 1, max: 5 },
  roughness: { min: 0, max: 1 },
  /** Share of the peak height where snow starts; 1 means no snow. */
  snowLine: { min: 0.3, max: 1 },
} as const

export const DEFAULT_MOUNTAIN_SETTINGS: MountainSettings = {
  height: 14,
  radius: 12,
  peakCount: 2,
  roughness: 0.35,
  snowLine: 0.72,
  seed: 1,
}

const GRID_SEGMENTS = 48
const MAIN_PEAK_AMPLITUDE_MIN = 0.85
const SIDE_PEAK_AMPLITUDE_MIN = 0.45
const SIDE_PEAK_AMPLITUDE_MAX = 0.8
const PEAK_AREA_RATIO = 0.4
const PEAK_SIGMA_MIN_RATIO = 0.22
const PEAK_SIGMA_MAX_RATIO = 0.4
const EDGE_FALLOFF_START = 0.6
const NOISE_OCTAVES = 4
const NOISE_BASE_FREQUENCY_RATIO = 3
const NOISE_HEIGHT_RATIO = 0.3
const NOISE_MIN_SLOPE_WEIGHT = 0.25
const HASH_PRIME_X = 374761393
const HASH_PRIME_Y = 668265263
const HASH_MIX = 1274126177
const UINT32_RANGE = 4294967296

export interface GeneratedMountain {
  positions: Float32Array
  indices: Uint32Array
  peakHeight: number
}

export function clampMountainSettings(settings: Partial<MountainSettings> = {}): MountainSettings {
  const merged = { ...DEFAULT_MOUNTAIN_SETTINGS, ...settings }
  return {
    height: clampRange(merged.height, MOUNTAIN_LIMITS.height),
    radius: clampRange(merged.radius, MOUNTAIN_LIMITS.radius),
    peakCount: clampIntegerRange(merged.peakCount, MOUNTAIN_LIMITS.peakCount),
    roughness: clampRange(merged.roughness, MOUNTAIN_LIMITS.roughness),
    snowLine: clampRange(merged.snowLine, MOUNTAIN_LIMITS.snowLine),
    seed: Math.round(merged.seed),
  }
}

function latticeValue(ix: number, iy: number, seed: number) {
  let hash = Math.imul(ix, HASH_PRIME_X) ^ Math.imul(iy, HASH_PRIME_Y) ^ Math.imul(seed, HASH_MIX)
  hash = Math.imul(hash ^ (hash >>> 13), HASH_MIX)
  return ((hash ^ (hash >>> 16)) >>> 0) / UINT32_RANGE
}

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const tx = smooth(x - ix)
  const ty = smooth(y - iy)
  const top = latticeValue(ix, iy, seed) * (1 - tx) + latticeValue(ix + 1, iy, seed) * tx
  const bottom = latticeValue(ix, iy + 1, seed) * (1 - tx) + latticeValue(ix + 1, iy + 1, seed) * tx
  return top * (1 - ty) + bottom * ty
}

function fractalNoise(x: number, y: number, seed: number) {
  let total = 0
  let amplitude = 1
  let frequency = 1
  let weight = 0
  for (let octave = 0; octave < NOISE_OCTAVES; octave += 1) {
    total += valueNoise(x * frequency, y * frequency, seed + octave) * amplitude
    weight += amplitude
    amplitude /= 2
    frequency *= 2
  }
  return total / weight
}

export function generateMountain(input: Partial<MountainSettings>): GeneratedMountain {
  const { height, radius, peakCount, roughness, seed } = clampMountainSettings(input)
  const random = createRandom(seed)

  const peaks = Array.from({ length: peakCount }, (_, index) => {
    const isMain = index === 0
    const angle = between(random, 0, Math.PI * 2)
    const distance = isMain ? 0 : Math.sqrt(random()) * radius * PEAK_AREA_RATIO
    return {
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      amplitude: height * (isMain
        ? between(random, MAIN_PEAK_AMPLITUDE_MIN, 1)
        : between(random, SIDE_PEAK_AMPLITUDE_MIN, SIDE_PEAK_AMPLITUDE_MAX)),
      variance: 2 * (radius * between(random, PEAK_SIGMA_MIN_RATIO, PEAK_SIGMA_MAX_RATIO)) ** 2,
    }
  })

  const vertexCount = (GRID_SEGMENTS + 1) ** 2
  const positions = new Float32Array(vertexCount * 3)
  let peakHeight = 0

  for (let row = 0; row <= GRID_SEGMENTS; row += 1) {
    for (let column = 0; column <= GRID_SEGMENTS; column += 1) {
      const x = (column / GRID_SEGMENTS - 0.5) * radius * 2
      const z = (row / GRID_SEGMENTS - 0.5) * radius * 2
      const edgeDistance = Math.min(1, Math.hypot(x, z) / radius)
      const falloff = 1 - smooth(Math.max(0, (edgeDistance - EDGE_FALLOFF_START) / (1 - EDGE_FALLOFF_START)))

      let base = 0
      for (const peak of peaks) {
        base += peak.amplitude * Math.exp(-((x - peak.x) ** 2 + (z - peak.z) ** 2) / peak.variance)
      }

      const slopeWeight = NOISE_MIN_SLOPE_WEIGHT + Math.min(1, base / height)
      const noise = (fractalNoise((x / radius) * NOISE_BASE_FREQUENCY_RATIO, (z / radius) * NOISE_BASE_FREQUENCY_RATIO, seed) - 0.5) * 2
      const y = Math.max(0, base + noise * roughness * height * NOISE_HEIGHT_RATIO * slopeWeight) * falloff

      const offset = (row * (GRID_SEGMENTS + 1) + column) * 3
      positions[offset] = x
      positions[offset + 1] = y
      positions[offset + 2] = z
      peakHeight = Math.max(peakHeight, y)
    }
  }

  const indices = new Uint32Array(GRID_SEGMENTS * GRID_SEGMENTS * 6)
  let cursor = 0
  for (let row = 0; row < GRID_SEGMENTS; row += 1) {
    for (let column = 0; column < GRID_SEGMENTS; column += 1) {
      const topLeft = row * (GRID_SEGMENTS + 1) + column
      const bottomLeft = topLeft + GRID_SEGMENTS + 1
      indices.set([topLeft, bottomLeft, topLeft + 1, topLeft + 1, bottomLeft, bottomLeft + 1], cursor)
      cursor += 6
    }
  }

  return { positions, indices, peakHeight }
}
