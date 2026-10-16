import { between, clampIntegerRange, clampRange, createRandom } from './seeded-random.ts'
import type { OceanSettings } from './types.ts'

export const OCEAN_LIMITS = {
  size: { min: 20, max: 1500 },
  segments: { min: 8, max: 128 },
  waveCount: { min: 1, max: 12 },
  amplitude: { min: 0.1, max: 3 },
  windDirection: { min: 0, max: 359 },
} as const

export const DEFAULT_OCEAN_SETTINGS: OceanSettings = {
  size: 180,
  segments: 64,
  waveCount: 7,
  amplitude: 1,
  windDirection: 0,
  seed: 1,
}

const MAX_DIRECTION_VARIATION = 0.48
const MAIN_WAVE_COUNT = 2
const MAIN_WAVE_AMPLITUDE_RANGE = { min: 0.06, max: 0.3 }
const SECONDARY_WAVE_AMPLITUDE_RANGE = { min: 0.06, max: 0.19 }
const WAVELENGTH_RANGE = { min: 7, max: 30 }
const SPEED_RANGE = { min: 0.45, max: 1.8 }
const STEEPNESS_RANGE = { min: 0.025, max: 0.095 }

export interface OceanWave {
  amplitude: number
  directionX: number
  directionZ: number
  frequency: number
  phase: number
  speed: number
  steepness: number
}

export function clampOceanSettings(settings: Partial<OceanSettings> = {}): OceanSettings {
  const merged = { ...DEFAULT_OCEAN_SETTINGS, ...settings }
  return {
    size: clampRange(merged.size, OCEAN_LIMITS.size),
    segments: clampIntegerRange(merged.segments, OCEAN_LIMITS.segments),
    waveCount: clampIntegerRange(merged.waveCount, OCEAN_LIMITS.waveCount),
    amplitude: clampRange(merged.amplitude, OCEAN_LIMITS.amplitude),
    windDirection: clampRange(merged.windDirection, OCEAN_LIMITS.windDirection),
    seed: Math.round(merged.seed),
  }
}

export function generateOceanWaves(settings: OceanSettings): OceanWave[] {
  const { waveCount, amplitude, windDirection, seed } = clampOceanSettings(settings)
  const random = createRandom(seed)
  const travelAngle = (windDirection * Math.PI) / 180

  return Array.from({ length: waveCount }, (_, index) => {
    const angle = travelAngle + (random() - 0.5) * MAX_DIRECTION_VARIATION
    const amplitudeRange = index < MAIN_WAVE_COUNT ? MAIN_WAVE_AMPLITUDE_RANGE : SECONDARY_WAVE_AMPLITUDE_RANGE
    return {
      amplitude: between(random, amplitudeRange.min, amplitudeRange.max) * amplitude,
      directionX: Math.cos(angle),
      directionZ: Math.sin(angle),
      frequency: (Math.PI * 2) / between(random, WAVELENGTH_RANGE.min, WAVELENGTH_RANGE.max),
      phase: random() * Math.PI * 2,
      speed: between(random, SPEED_RANGE.min, SPEED_RANGE.max),
      steepness: between(random, STEEPNESS_RANGE.min, STEEPNESS_RANGE.max),
    }
  })
}
