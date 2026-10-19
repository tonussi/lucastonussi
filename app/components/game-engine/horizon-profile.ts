import { clampMountainSettings } from './mountain-generator.ts'
import type { EngineSceneObject } from './types.ts'

const HORIZON_PROFILE = {
  version: 2,
  horizontalScale: 2,
  verticalScale: 0.75,
  minimumRadius: 55,
  roughness: 0.12,
  peakCount: 2,
} as const

/** Apply once; subsequent Inspector edits and JSON round-trips retain their values. */
export function broadenHorizonMountain(object: EngineSceneObject): EngineSceneObject {
  if (object.kind !== 'mountain' || object.properties?.landmark !== 'himalaya' ||
      object.properties?.horizonProfile === HORIZON_PROFILE.version) return object
  const mountain = clampMountainSettings(object.mountain)
  return {
    ...object,
    scale: [object.scale[0] * HORIZON_PROFILE.horizontalScale, object.scale[1] * HORIZON_PROFILE.verticalScale, object.scale[2] * HORIZON_PROFILE.horizontalScale],
    mountain: { ...mountain, radius: Math.max(mountain.radius, HORIZON_PROFILE.minimumRadius),
      roughness: HORIZON_PROFILE.roughness, peakCount: HORIZON_PROFILE.peakCount },
    properties: { ...object.properties, horizonProfile: HORIZON_PROFILE.version },
  }
}
