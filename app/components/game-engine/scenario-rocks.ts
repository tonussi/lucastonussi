import { baseObject } from './scenario-objects.ts'
import { DEFAULT_ROCK_SETTINGS } from './rock-generator.ts'
import { between } from './seeded-random.ts'
import { TERRAIN_CELL_SIZE, type Terrain } from './terrain-grid.ts'
import type { EngineSceneObject } from './types.ts'

type Range = [number, number]

export interface RockStyle {
  name: string
  color: string
  size: Range
  flatness: Range
  elongation: Range
  roughness: Range
}

export const ROCK_STYLES: Record<string, RockStyle> = {
  boulder: { name: 'Boulder', color: '#8b8780', size: [1.2, 2.6], flatness: [0.7, 0.95], elongation: [1, 1.3], roughness: [0.2, 0.45] },
  slab: { name: 'Slab', color: '#a39a8c', size: [1.8, 3.4], flatness: [0.3, 0.5], elongation: [1.6, 2.6], roughness: [0.1, 0.3] },
  pillar: { name: 'Pillar', color: '#6e6a66', size: [0.9, 1.6], flatness: [1.6, 2.2], elongation: [1, 1.3], roughness: [0.25, 0.5] },
  cliffstone: { name: 'Cliff Stone', color: '#5b5b5f', size: [2.5, 4.5], flatness: [0.8, 1.2], elongation: [1, 1.8], roughness: [0.3, 0.55] },
}

export const SEAM_STYLE_KEYS = ['boulder', 'slab', 'pillar', 'cliffstone']
export const COAST_STYLE_KEYS = ['cliffstone', 'pillar', 'boulder']

const SEAM_ROCK_LIMIT = 70
const COAST_ROCK_LIMIT = 30
const COAST_ROCK_RATE = 0.5
const SEAM_ROCKS_PER_EDGE = { min: 1, max: 2 }
const EDGE_SPREAD_RATIO = 0.8
const SEAM_OFFSET = 1.2
const DROP_SIZE_DIVISOR = 8
const COAST_WATER_OFFSET = 1.5
const WATERLINE_SINK = 0.3
const STONE_SPACING = 9
const STONES_PER_ISLAND = 14
const STONE_SIZE_SCALE = 0.8

export function createRock(
  id: string,
  styleKey: string,
  position: [number, number, number],
  random: () => number,
  sizeScale = 1,
): EngineSceneObject {
  const style = ROCK_STYLES[styleKey]
  return {
    ...baseObject(id, style.name, 'rock', style.color, position, random() * Math.PI * 2),
    rock: {
      ...DEFAULT_ROCK_SETTINGS,
      size: between(random, ...style.size) * sizeScale,
      flatness: between(random, ...style.flatness),
      elongation: between(random, ...style.elongation),
      roughness: between(random, ...style.roughness),
      seed: Math.floor(random() * 1e6),
    },
  }
}

const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)]

/** Rocks standing at the foot of every cliff between cells and along the coast. */
export function buildSeamRocks(prefix: string, terrain: Terrain, oceanY: number, random: () => number): EngineSceneObject[] {
  const rocks: EngineSceneObject[] = []
  const halfEdge = (TERRAIN_CELL_SIZE / 2) * EDGE_SPREAD_RATIO

  for (const seam of terrain.seams) {
    if (rocks.length >= SEAM_ROCK_LIMIT + COAST_ROCK_LIMIT) break
    const tangent: [number, number] = [-seam.normal[1], seam.normal[0]]
    const sizeScale = 1 + seam.drop / DROP_SIZE_DIVISOR

    if (seam.coast) {
      if (random() > COAST_ROCK_RATE) continue
      const along = between(random, -halfEdge, halfEdge)
      const x = seam.x + seam.normal[0] * COAST_WATER_OFFSET + tangent[0] * along
      const z = seam.z + seam.normal[1] * COAST_WATER_OFFSET + tangent[1] * along
      if (terrain.heightAt(x, z) !== undefined) continue
      rocks.push(createRock(`${prefix}-coast-rock-${rocks.length}`, pick(COAST_STYLE_KEYS, random), [x, oceanY - WATERLINE_SINK, z], random, sizeScale))
      continue
    }

    const count = SEAM_ROCKS_PER_EDGE.min + Math.floor(random() * (SEAM_ROCKS_PER_EDGE.max - SEAM_ROCKS_PER_EDGE.min + 1))
    for (let index = 0; index < count; index += 1) {
      const along = between(random, -halfEdge, halfEdge)
      const x = seam.x + seam.normal[0] * SEAM_OFFSET + tangent[0] * along
      const z = seam.z + seam.normal[1] * SEAM_OFFSET + tangent[1] * along
      if (terrain.heightAt(x, z) !== seam.lowerTop) continue
      rocks.push(createRock(`${prefix}-seam-rock-${rocks.length}`, pick(SEAM_STYLE_KEYS, random), [x, seam.lowerTop, z], random, sizeScale))
    }
  }
  return rocks
}

/** Slabs and boulders laid over the water between an island and the nearest mainland cell. */
export function buildStepStones(prefix: string, terrain: Terrain, oceanY: number, random: () => number): EngineSceneObject[] {
  const mainland = terrain.cells.filter(({ island }) => !island)
  const stones: EngineSceneObject[] = []
  for (const start of terrain.islandCenters) {
    const target = mainland.reduce((nearest, cell) =>
      Math.hypot(cell.x - start.x, cell.z - start.z) < Math.hypot(nearest.x - start.x, nearest.z - start.z) ? cell : nearest)
    const distance = Math.hypot(target.x - start.x, target.z - start.z)
    const steps = Math.min(STONES_PER_ISLAND, Math.floor(distance / STONE_SPACING))
    for (let step = 1; step <= steps; step += 1) {
      const t = (step * STONE_SPACING) / distance
      const x = start.x + (target.x - start.x) * t + between(random, -1, 1)
      const z = start.z + (target.z - start.z) * t + between(random, -1, 1)
      if (terrain.heightAt(x, z) !== undefined) continue
      stones.push(createRock(`${prefix}-stone-${stones.length}`, random() < 0.5 ? 'slab' : 'boulder', [x, oceanY - WATERLINE_SINK, z], random, STONE_SIZE_SCALE))
    }
  }
  return stones
}
