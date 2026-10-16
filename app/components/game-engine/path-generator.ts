import { clampRange, createRandom } from './seeded-random.ts'
import type { PathSettings } from './types.ts'

export const PATH_LIMITS = {
  length: { min: 6, max: 300 },
  width: { min: 0.8, max: 8 },
  wiggle: { min: 0, max: 1 },
} as const

export const DEFAULT_PATH_SETTINGS: PathSettings = {
  length: 40,
  width: 2.5,
  wiggle: 0.4,
  seed: 1,
}

export const PATH_STEP = 2
export const PATH_HEIGHT = 0.04
const MAX_TURN_PER_STEP = 0.5

export type PathPoint = [number, number]

export interface GeneratedPath {
  /** Centerline in local XZ space; starts at the origin heading toward +Z. */
  centerline: PathPoint[]
  positions: Float32Array
  indices: Uint32Array
}

export function clampPathSettings(settings: Partial<PathSettings> = {}): PathSettings {
  const merged = { ...DEFAULT_PATH_SETTINGS, ...settings }
  return {
    length: clampRange(merged.length, PATH_LIMITS.length),
    width: clampRange(merged.width, PATH_LIMITS.width),
    wiggle: clampRange(merged.wiggle, PATH_LIMITS.wiggle),
    seed: Math.round(merged.seed),
  }
}

export function generatePath(input: Partial<PathSettings>): GeneratedPath {
  const { length, width, wiggle, seed } = clampPathSettings(input)
  const random = createRandom(seed)
  const stepCount = Math.max(1, Math.round(length / PATH_STEP))

  const centerline: PathPoint[] = [[0, 0]]
  let heading = 0
  for (let step = 0; step < stepCount; step += 1) {
    heading += (random() * 2 - 1) * MAX_TURN_PER_STEP * wiggle
    const [x, z] = centerline[step]
    centerline.push([x + Math.sin(heading) * PATH_STEP, z + Math.cos(heading) * PATH_STEP])
  }

  const positions = new Float32Array(centerline.length * 2 * 3)
  const half = width / 2
  centerline.forEach(([x, z], index) => {
    const [nextX, nextZ] = centerline[Math.min(index + 1, centerline.length - 1)]
    const [prevX, prevZ] = centerline[Math.max(index - 1, 0)]
    const tangentLength = Math.hypot(nextX - prevX, nextZ - prevZ) || 1
    const normalX = (nextZ - prevZ) / tangentLength
    const normalZ = -(nextX - prevX) / tangentLength
    positions.set([x - normalX * half, PATH_HEIGHT, z - normalZ * half], index * 6)
    positions.set([x + normalX * half, PATH_HEIGHT, z + normalZ * half], index * 6 + 3)
  })

  const indices = new Uint32Array(stepCount * 6)
  for (let step = 0; step < stepCount; step += 1) {
    const left = step * 2
    indices.set([left, left + 2, left + 1, left + 1, left + 2, left + 3], step * 6)
  }
  return { centerline, positions, indices }
}
