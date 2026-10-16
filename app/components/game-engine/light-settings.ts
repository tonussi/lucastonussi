import type { LightSettings } from './types.ts'

export const MAX_SCENE_LIGHTS = 8
export const LIGHT_SPAWN_HEIGHT = 2

export const RANGED_LIGHT_TYPES: LightSettings['lightType'][] = ['point', 'spot']

export const ORBIT_LIGHT_TYPES: LightSettings['lightType'][] = ['point', 'spot', 'directional']

export const LIGHT_TYPES = ['point', 'spot', 'directional', 'ambient'] as const

export const LIGHT_LIMITS = {
  intensity: { min: 0, max: 200 },
  distance: { min: 1, max: 100 },
  angle: { min: 5, max: 90 },
  orbitRadius: { min: 0, max: 50 },
  orbitSpeed: { min: -360, max: 360 },
} as const

export const DEFAULT_LIGHT_SETTINGS: LightSettings = {
  lightType: 'point',
  intensity: 40,
  distance: 20,
  angle: 45,
  orbitRadius: 0,
  orbitSpeed: 45,
}

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

export function clampLightSettings(settings: Partial<LightSettings> = {}): LightSettings {
  const merged = { ...DEFAULT_LIGHT_SETTINGS, ...settings }
  return {
    lightType: LIGHT_TYPES.includes(merged.lightType) ? merged.lightType : DEFAULT_LIGHT_SETTINGS.lightType,
    intensity: clamp(merged.intensity, LIGHT_LIMITS.intensity),
    distance: clamp(merged.distance, LIGHT_LIMITS.distance),
    angle: clamp(merged.angle, LIGHT_LIMITS.angle),
    orbitRadius: clamp(merged.orbitRadius, LIGHT_LIMITS.orbitRadius),
    orbitSpeed: clamp(merged.orbitSpeed, LIGHT_LIMITS.orbitSpeed),
  }
}
