import { between, clampRange, createRandom } from './seeded-random.ts'
import type { RockSettings } from './types.ts'

export const ROCK_LIMITS = {
  size: { min: 0.2, max: 8 },
  roughness: { min: 0, max: 0.6 },
  flatness: { min: 0.3, max: 2.2 },
  elongation: { min: 1, max: 3 },
} as const

export const DEFAULT_ROCK_SETTINGS: RockSettings = {
  size: 1.2,
  roughness: 0.3,
  flatness: 0.7,
  elongation: 1,
  seed: 1,
}

export const ROCK_DETAIL = 1
const BUMP_COUNT = 5
const BUMP_FREQUENCY = { min: 1.2, max: 3.2 }
const BUMP_AMPLITUDE = { min: 0.4, max: 1 }

export interface RockBump {
  direction: [number, number, number]
  frequency: number
  phase: number
  amplitude: number
}

export function clampRockSettings(settings: Partial<RockSettings> = {}): RockSettings {
  const merged = { ...DEFAULT_ROCK_SETTINGS, ...settings }
  return {
    size: clampRange(merged.size, ROCK_LIMITS.size),
    roughness: clampRange(merged.roughness, ROCK_LIMITS.roughness),
    flatness: clampRange(merged.flatness, ROCK_LIMITS.flatness),
    elongation: clampRange(merged.elongation, ROCK_LIMITS.elongation),
    seed: Math.round(merged.seed),
  }
}

export function generateRockBumps(seed: number): RockBump[] {
  const random = createRandom(Math.round(seed))
  return Array.from({ length: BUMP_COUNT }, () => {
    const x = random() * 2 - 1
    const y = random() * 2 - 1
    const z = random() * 2 - 1
    const length = Math.hypot(x, y, z) || 1
    return {
      direction: [x / length, y / length, z / length],
      frequency: between(random, BUMP_FREQUENCY.min, BUMP_FREQUENCY.max),
      phase: random() * Math.PI * 2,
      amplitude: between(random, BUMP_AMPLITUDE.min, BUMP_AMPLITUDE.max),
    }
  })
}

/** Position on the rock surface for a unit direction. */
export function rockSurfacePoint(
  direction: [number, number, number],
  settings: RockSettings,
  bumps: RockBump[],
): [number, number, number] {
  const totalAmplitude = bumps.reduce((total, { amplitude }) => total + amplitude, 0)
  const noise = bumps.reduce((total, bump) => {
    const dot = direction[0] * bump.direction[0] + direction[1] * bump.direction[1] + direction[2] * bump.direction[2]
    return total + Math.sin(dot * bump.frequency * Math.PI + bump.phase) * bump.amplitude
  }, 0) / totalAmplitude
  const radius = settings.size * (1 + settings.roughness * noise)
  return [direction[0] * radius * settings.elongation, direction[1] * radius * settings.flatness, direction[2] * radius]
}
