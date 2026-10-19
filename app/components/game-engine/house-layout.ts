import { clampRange } from './seeded-random.ts'
import type { HouseSettings } from './types.ts'

export const HOUSE_LIMITS = {
  width: { min: 3, max: 20 },
  depth: { min: 3, max: 20 },
  wallHeight: { min: 4, max: 8 },
  roofHeight: { min: 0.5, max: 8 },
} as const

export const DEFAULT_HOUSE_SETTINGS: HouseSettings = {
  width: 6,
  depth: 5,
  wallHeight: 4.5,
  roofHeight: 2,
}

export const DOOR_WIDTH = 2
export const DOOR_HEIGHT = 3
export const WINDOW_SETTINGS = {
  width: 1.4,
  /** Tall enough that a standing first-person eye (about 1.5 above the floor) sits well inside it. */
  height: 2.2,
  /** Height of the window's lower edge above the floor. */
  sill: 0.9,
  /** Solid wall kept at both ends of a window. */
  margin: 0.4,
  /** Target distance between windows on a long wall. */
  spacing: 4,
} as const
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

export interface HouseWindow {
  /** Center of the opening, in house space. */
  position: Vec3
  /** Opening size along the wall, height and wall thickness. */
  size: Vec3
  axis: 'x' | 'z'
}

function windowCenters(length: number) {
  const { width, margin, spacing } = WINDOW_SETTINGS
  if (length < width + margin * 2) return []
  const count = Math.max(1, Math.floor(length / spacing))
  return Array.from({ length: count }, (_, index) => -length / 2 + (length * (index + 0.5)) / count)
}

/** A wall run cut by real openings; solid pieces surround every window so collisions match what is seen. */
function windowedWall(
  center: [number, number], length: number, axis: 'x' | 'z', wallHeight: number,
): { pieces: HousePiece[]; windows: HouseWindow[] } {
  const { width, height, sill } = WINDOW_SETTINGS
  const at = (along: number, y: number, span: number, tall: number): HousePiece => ({
    kind: 'wall',
    position: axis === 'x' ? [center[0] + along, y, center[1]] : [center[0], y, center[1] + along],
    size: axis === 'x' ? [span, tall, WALL_THICKNESS] : [WALL_THICKNESS, tall, span],
    rotationZ: 0,
    solid: true,
  })
  const pieces: HousePiece[] = []
  const windows: HouseWindow[] = []
  let cursor = -length / 2
  const solidRun = (end: number) => {
    if (end - cursor > 1e-6) pieces.push(at((cursor + end) / 2, wallHeight / 2, end - cursor, wallHeight))
  }
  windowCenters(length).forEach((along) => {
    solidRun(along - width / 2)
    pieces.push(at(along, sill / 2, width, sill))
    pieces.push(at(along, (sill + height + wallHeight) / 2, width, wallHeight - sill - height))
    const [x, z] = axis === 'x' ? [center[0] + along, center[1]] : [center[0], center[1] + along]
    windows.push({ position: [x, sill + height / 2, z], size: [width, height, WALL_THICKNESS], axis })
    cursor = along + width / 2
  })
  solidRun(length / 2)
  return { pieces, windows }
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
export function buildHouseWalls(input: Partial<HouseSettings>) {
  const { width, depth, wallHeight } = clampHouseSettings(input)
  const frontZ = depth / 2 - WALL_THICKNESS / 2
  const frontSideWidth = (width - DOOR_WIDTH) / 2
  const frontSideX = DOOR_WIDTH / 2 + frontSideWidth / 2
  const lintelHeight = wallHeight - DOOR_HEIGHT
  const runs = [
    windowedWall([0, -depth / 2 + WALL_THICKNESS / 2], width, 'x', wallHeight),
    windowedWall([-width / 2 + WALL_THICKNESS / 2, 0], depth, 'z', wallHeight),
    windowedWall([width / 2 - WALL_THICKNESS / 2, 0], depth, 'z', wallHeight),
    windowedWall([-frontSideX, frontZ], frontSideWidth, 'x', wallHeight),
    windowedWall([frontSideX, frontZ], frontSideWidth, 'x', wallHeight),
  ]
  const lintel: HousePiece = { kind: 'wall', position: [0, DOOR_HEIGHT + lintelHeight / 2, frontZ], size: [DOOR_WIDTH, lintelHeight, WALL_THICKNESS], rotationZ: 0, solid: true }
  return { pieces: [...runs.flatMap((run) => run.pieces), lintel], windows: runs.flatMap((run) => run.windows) }
}

export const buildHouseWindows = (input: Partial<HouseSettings>) => buildHouseWalls(input).windows

export function buildHouse(input: Partial<HouseSettings>): HousePiece[] {
  const { width, depth, wallHeight, roofHeight } = clampHouseSettings(input)

  const frontZ = depth / 2 - WALL_THICKNESS / 2

  const slope = Math.atan2(roofHeight, width / 2)
  const slabLength = Math.hypot(width / 2, roofHeight) + ROOF_OVERHANG
  const slabCenterX = width / 4
  const slabCenterY = wallHeight + roofHeight / 2 + ROOF_THICKNESS / 2
  const roofDepth = depth + ROOF_OVERHANG * 2

  return [
    ...buildHouseWalls(input).pieces,
    { kind: 'floor', position: [0, -FLOOR_THICKNESS / 2, 0], size: [width, FLOOR_THICKNESS, depth], rotationZ: 0, solid: true },
    { kind: 'roof', position: [-slabCenterX, slabCenterY, 0], size: [slabLength, ROOF_THICKNESS, roofDepth], rotationZ: slope, solid: false },
    { kind: 'roof', position: [slabCenterX, slabCenterY, 0], size: [slabLength, ROOF_THICKNESS, roofDepth], rotationZ: -slope, solid: false },
    { kind: 'gable', position: [0, wallHeight, frontZ], size: [width, roofHeight, WALL_THICKNESS], rotationZ: 0, solid: false },
    { kind: 'gable', position: [0, wallHeight, -depth / 2 + WALL_THICKNESS / 2], size: [width, roofHeight, WALL_THICKNESS], rotationZ: 0, solid: false },
  ]
}
