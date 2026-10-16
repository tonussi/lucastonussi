import { between, createRandom } from './seeded-random.ts'

export const TERRAIN_CELL_SIZE = 30
export const TERRAIN_STEP = 2
const EDGE_NOISE_CELLS = 2.5
const EDGE_NOISE_FREQUENCY = 0.35
const LOBE_COUNT = 3
const LOBE_RADIUS_CELLS = { min: 2, max: 4 }
const ISLAND_COUNT = { min: 2, max: 3 }
const ISLAND_RADIUS_CELLS = { min: 1.4, max: 2.6 }
const ISLAND_GAP_CELLS = { min: 3.5, max: 7 }
const ISLAND_MAX_STEPS = 2
const SPAWN_LAND_CELLS = 1.5
const HASH_PRIME_X = 374761393
const HASH_PRIME_Y = 668265263
const HASH_MIX = 1274126177
const UINT32_RANGE = 4294967296
const RELIEF_NOISE_SCALE = 0.45

export interface FlatZone {
  x: number
  z: number
  reach: number
}

export interface TerrainCell {
  x: number
  z: number
  top: number
  island: boolean
}

export interface Seam {
  /** Midpoint of the shared edge. */
  x: number
  z: number
  /** Unit vector from the higher cell toward the lower cell (or toward open water). */
  normal: [number, number]
  lowerTop: number
  drop: number
  /** True when the lower side is open water instead of another cell. */
  coast: boolean
}

export interface Terrain {
  cells: TerrainCell[]
  seams: Seam[]
  halfWidth: number
  islandCenters: { x: number; z: number }[]
  /** Ground height at a point, or undefined when there is no land there. */
  heightAt: (x: number, z: number) => number | undefined
}

interface TerrainInput {
  halfLength: number
  halfWidth: number
  relief: number
  seed: number
  flatZones: FlatZone[]
}

function lattice(ix: number, iz: number, seed: number) {
  let hash = Math.imul(ix, HASH_PRIME_X) ^ Math.imul(iz, HASH_PRIME_Y) ^ Math.imul(seed, HASH_MIX)
  hash = Math.imul(hash ^ (hash >>> 13), HASH_MIX)
  return ((hash ^ (hash >>> 16)) >>> 0) / UINT32_RANGE
}

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x: number, z: number, seed: number) {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const tx = smooth(x - ix)
  const tz = smooth(z - iz)
  const top = lattice(ix, iz, seed) * (1 - tx) + lattice(ix + 1, iz, seed) * tx
  const bottom = lattice(ix, iz + 1, seed) * (1 - tx) + lattice(ix + 1, iz + 1, seed) * tx
  return top * (1 - tz) + bottom * tz
}

const cellKey = (column: number, row: number) => `${column},${row}`
const NEIGHBORS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]]

interface Blob {
  x: number
  z: number
  radius: number
  island: boolean
}

export function buildTerrain({ halfLength, halfWidth, relief, seed, flatZones }: TerrainInput): Terrain {
  const random = createRandom(seed)
  const cellSize = TERRAIN_CELL_SIZE
  const edgeAmplitude = cellSize * EDGE_NOISE_CELLS

  const lobes: Blob[] = Array.from({ length: LOBE_COUNT }, () => ({
    x: between(random, -halfLength * 0.7, halfLength * 0.7),
    z: halfWidth + between(random, -cellSize, cellSize * 0.5),
    radius: cellSize * between(random, LOBE_RADIUS_CELLS.min, LOBE_RADIUS_CELLS.max),
    island: false,
  }))
  const islandCount = ISLAND_COUNT.min + Math.floor(random() * (ISLAND_COUNT.max - ISLAND_COUNT.min + 1))
  const islands: Blob[] = Array.from({ length: islandCount }, () => {
    const radius = cellSize * between(random, ISLAND_RADIUS_CELLS.min, ISLAND_RADIUS_CELLS.max)
    return {
      x: between(random, -halfLength * 0.8, halfLength * 0.8),
      z: halfWidth + edgeAmplitude + radius + cellSize * between(random, ISLAND_GAP_CELLS.min, ISLAND_GAP_CELLS.max),
      radius,
      island: true,
    }
  })

  const insideBlob = (blob: Blob, x: number, z: number, column: number, row: number) => {
    const wobble = 1 + (lattice(column, row, seed + 5) - 0.5) * 0.5
    return Math.hypot(x - blob.x, (z - blob.z) * 1.2) <= blob.radius * wobble
  }

  const cells = new Map<string, TerrainCell>()
  const columns = Math.ceil((halfLength + edgeAmplitude) / cellSize)
  const rowsBack = Math.ceil(halfWidth / cellSize)
  const rowsFront = Math.ceil((halfWidth + edgeAmplitude * 3 + cellSize * 12) / cellSize)

  for (let row = -rowsBack; row <= rowsFront; row += 1) {
    for (let column = -columns; column <= columns; column += 1) {
      const x = column * cellSize
      const z = row * cellSize
      const distanceOutsideRect = Math.max(Math.abs(x) - halfLength, Math.abs(z) - halfWidth)
      const edgeNoise = (valueNoise(column * EDGE_NOISE_FREQUENCY, row * EDGE_NOISE_FREQUENCY, seed + 3) - 0.5) * 2 * edgeAmplitude
      const nearSpawn = Math.hypot(x, z) <= cellSize * SPAWN_LAND_CELLS
      const island = islands.some((blob) => insideBlob(blob, x, z, column, row))
      const mainland = nearSpawn || distanceOutsideRect + edgeNoise <= 0 || lobes.some((blob) => insideBlob(blob, x, z, column, row))
      if (!mainland && !island) continue
      const isFlat = mainland && flatZones.some((zone) => Math.hypot(zone.x - x, zone.z - z) < zone.reach)
      const steps = isFlat
        ? 0
        : mainland
          ? Math.round(valueNoise(column * RELIEF_NOISE_SCALE, row * RELIEF_NOISE_SCALE, seed) * relief)
          : 1 + Math.floor(lattice(column, row, seed + 9) * Math.min(ISLAND_MAX_STEPS, Math.max(relief, 1)))
      cells.set(cellKey(column, row), { x, z, top: steps * TERRAIN_STEP, island: !mainland })
    }
  }

  const seams: Seam[] = []
  cells.forEach((cell, key) => {
    const [column, row] = key.split(',').map(Number)
    NEIGHBORS.forEach(([dx, dz]) => {
      const neighbor = cells.get(cellKey(column + dx, row + dz))
      const edgeX = cell.x + (dx * cellSize) / 2
      const edgeZ = cell.z + (dz * cellSize) / 2
      if (!neighbor) {
        seams.push({ x: edgeX, z: edgeZ, normal: [dx, dz], lowerTop: -Infinity, drop: cell.top, coast: true })
        return
      }
      if (neighbor.top < cell.top && neighbor.island === cell.island) {
        seams.push({ x: edgeX, z: edgeZ, normal: [dx, dz], lowerTop: neighbor.top, drop: cell.top - neighbor.top, coast: false })
      }
    })
  })

  return {
    cells: [...cells.values()],
    seams,
    halfWidth,
    islandCenters: islands.map(({ x, z }) => ({ x, z })),
    heightAt: (x, z) => cells.get(cellKey(Math.round(x / cellSize), Math.round(z / cellSize)))?.top,
  }
}
