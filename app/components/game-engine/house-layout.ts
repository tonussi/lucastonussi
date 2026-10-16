import { clampRange } from './seeded-random.ts'
import type { HouseSettings } from './types.ts'

export const HOUSE_LIMITS = {
  width: { min: 3, max: 20 },
  depth: { min: 3, max: 20 },
  wallHeight: { min: 2.5, max: 8 },
  roofHeight: { min: 0.5, max: 8 },
} as const

export const DEFAULT_HOUSE_SETTINGS: HouseSettings = {
  width: 6,
  depth: 5,
  wallHeight: 3,
  roofHeight: 2,
}

export const DOOR_WIDTH = 1.2
export const DOOR_HEIGHT = 2.1
const WALL_THICKNESS = 0.25
const FLOOR_THICKNESS = 0.2
const ROOF_THICKNESS = 0.18
const ROOF_OVERHANG = 0.35

export type Vec3 = [number, number, number]
export type HousePieceKind = 'floor' | 'wall' | 'roof' | 'gable'

export interface HousePiece {
  kind: HousePieceKind
  position: Vec3
  size: Vec3
  rotationZ: number
  solid: boolean
}

export function clampHouseSettings(settings: Partial<HouseSettings> = {}): HouseSettings {
  const merged = { ...DEFAULT_HOUSE_SETTINGS, ...settings }
  return {
    width: clampRange(merged.width, HOUSE_LIMITS.width),
    depth: clampRange(merged.depth, HOUSE_LIMITS.depth),
    wallHeight: clampRange(merged.wallHeight, HOUSE_LIMITS.wallHeight),
    roofHeight: clampRange(merged.roofHeight, HOUSE_LIMITS.roofHeight),
  }
}

/** The front wall (+Z) has an empty door opening; the door itself is a separate object. */
export function buildHouse(input: Partial<HouseSettings>): HousePiece[] {
  const { width, depth, wallHeight, roofHeight } = clampHouseSettings(input)
  const wall = (position: Vec3, size: Vec3): HousePiece => ({
    kind: 'wall', position, size, rotationZ: 0, solid: true,
  })

  const frontZ = depth / 2 - WALL_THICKNESS / 2
  const frontSideWidth = (width - DOOR_WIDTH) / 2
  const frontSideX = DOOR_WIDTH / 2 + frontSideWidth / 2
  const lintelHeight = wallHeight - DOOR_HEIGHT

  const slope = Math.atan2(roofHeight, width / 2)
  const slabLength = Math.hypot(width / 2, roofHeight) + ROOF_OVERHANG
  const slabCenterX = width / 4
  const slabCenterY = wallHeight + roofHeight / 2 + ROOF_THICKNESS / 2
  const roofDepth = depth + ROOF_OVERHANG * 2

  return [
    { kind: 'floor', position: [0, -FLOOR_THICKNESS / 2, 0], size: [width, FLOOR_THICKNESS, depth], rotationZ: 0, solid: true },
    wall([0, wallHeight / 2, -depth / 2 + WALL_THICKNESS / 2], [width, wallHeight, WALL_THICKNESS]),
    wall([-width / 2 + WALL_THICKNESS / 2, wallHeight / 2, 0], [WALL_THICKNESS, wallHeight, depth]),
    wall([width / 2 - WALL_THICKNESS / 2, wallHeight / 2, 0], [WALL_THICKNESS, wallHeight, depth]),
    wall([-frontSideX, wallHeight / 2, frontZ], [frontSideWidth, wallHeight, WALL_THICKNESS]),
    wall([frontSideX, wallHeight / 2, frontZ], [frontSideWidth, wallHeight, WALL_THICKNESS]),
    wall([0, DOOR_HEIGHT + lintelHeight / 2, frontZ], [DOOR_WIDTH, lintelHeight, WALL_THICKNESS]),
    { kind: 'roof', position: [-slabCenterX, slabCenterY, 0], size: [slabLength, ROOF_THICKNESS, roofDepth], rotationZ: slope, solid: false },
    { kind: 'roof', position: [slabCenterX, slabCenterY, 0], size: [slabLength, ROOF_THICKNESS, roofDepth], rotationZ: -slope, solid: false },
    { kind: 'gable', position: [0, wallHeight, frontZ], size: [width, roofHeight, WALL_THICKNESS], rotationZ: 0, solid: false },
    { kind: 'gable', position: [0, wallHeight, -depth / 2 + WALL_THICKNESS / 2], size: [width, roofHeight, WALL_THICKNESS], rotationZ: 0, solid: false },
  ]
}
