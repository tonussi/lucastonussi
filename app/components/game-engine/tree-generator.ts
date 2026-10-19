import { between, createRandom } from './seeded-random.ts'
import type { TreeSettings } from './types.ts'

export const TREE_LIMITS = {
  height: { min: 1, max: 20 },
  branchCount: { min: 0, max: 40 },
  leafCount: { min: 0, max: 600 },
  leafSize: { min: 0.05, max: 2 },
} as const

export const DEFAULT_TREE_SETTINGS: TreeSettings = {
  height: 4,
  branchCount: 8,
  leafCount: 120,
  leafSize: 0.25,
  seed: 1,
}

export const TRUNK_RADIUS_RATIO = 0.035
const BRANCH_RADIUS_RATIO = 0.45
const BRANCH_START_MIN = 0.35
const BRANCH_START_MAX = 0.9
const BRANCH_LENGTH_MIN = 0.22
const BRANCH_LENGTH_MAX = 0.45
const BRANCH_PITCH_MIN = 0.35
const BRANCH_PITCH_MAX = 1.1
const CROWN_RADIUS_RATIO = 0.4
const CROWN_CENTER_RATIO = 0.8
const LEAF_SIZE_VARIATION = 0.5
const MIN_BRANCH_RADIUS = 0.01

export type Vec3 = [number, number, number]

export interface TreeBranch {
  start: Vec3
  end: Vec3
  radius: number
}

export interface TreeLeaf {
  position: Vec3
  size: number
}

export interface GeneratedTree {
  trunk: TreeBranch
  branches: TreeBranch[]
  leaves: TreeLeaf[]
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function clampTreeSettings(settings: Partial<TreeSettings> = {}): TreeSettings {
  const merged = { ...DEFAULT_TREE_SETTINGS, ...settings }
  const { height, branchCount, leafCount, leafSize } = TREE_LIMITS
  return {
    height: Math.min(height.max, Math.max(height.min, merged.height)),
    branchCount: clampInteger(merged.branchCount, branchCount.min, branchCount.max),
    leafCount: clampInteger(merged.leafCount, leafCount.min, leafCount.max),
    leafSize: Math.min(leafSize.max, Math.max(leafSize.min, merged.leafSize)),
    seed: Math.round(merged.seed),
  }
}

export function generateTree(input: Partial<TreeSettings>): GeneratedTree {
  const { height, branchCount, leafCount, leafSize, seed } = clampTreeSettings(input)
  const random = createRandom(seed)
  const trunkRadius = height * TRUNK_RADIUS_RATIO

  const trunk: TreeBranch = { start: [0, 0, 0], end: [0, height, 0], radius: trunkRadius }

  const branches: TreeBranch[] = Array.from({ length: branchCount }, () => {
    const startY = height * between(random, BRANCH_START_MIN, BRANCH_START_MAX)
    const length = height * between(random, BRANCH_LENGTH_MIN, BRANCH_LENGTH_MAX)
    const yaw = between(random, 0, Math.PI * 2)
    const pitch = between(random, BRANCH_PITCH_MIN, BRANCH_PITCH_MAX)
    const horizontal = Math.sin(pitch) * length
    return {
      start: [0, startY, 0],
      end: [Math.cos(yaw) * horizontal, startY + Math.cos(pitch) * length, Math.sin(yaw) * horizontal],
      radius: Math.max(MIN_BRANCH_RADIUS, trunkRadius * BRANCH_RADIUS_RATIO),
    }
  })

  const crownRadius = height * CROWN_RADIUS_RATIO
  const anchors = branches.length > 0 ? branches.map(({ end }) => end) : [trunk.end]
  const leaves: TreeLeaf[] = Array.from({ length: leafCount }, (_, index) => {
    const [anchorX, anchorY, anchorZ] = anchors[index % anchors.length]
    const spread = anchors.length > 1 ? crownRadius / 3 : crownRadius / 2
    const yaw = random() * Math.PI * 2
    const vertical = between(random, -1, 1)
    const radial = Math.cbrt(random()) * spread
    const horizontal = Math.sqrt(1 - vertical * vertical) * radial
    return {
      position: [
        anchorX + Math.cos(yaw) * horizontal,
        anchorY + vertical * radial * 0.65 + (anchors.length > 1 ? 0 : height * (CROWN_CENTER_RATIO - 1)),
        anchorZ + Math.sin(yaw) * horizontal,
      ],
      size: leafSize * between(random, 1 - LEAF_SIZE_VARIATION, 1 + LEAF_SIZE_VARIATION),
    }
  })

  return { trunk, branches, leaves }
}
