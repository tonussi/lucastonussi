import * as THREE from 'three'

/** One instance is a tuft of thin, curved, tapered blades, so a few thousand instances read as dense turf. */
export const TUFT_BLADES = 6
/** World-space radius of a tuft; the instance scale on X/Z. */
export const TUFT_RADIUS = 0.3
const BLADE_SEGMENTS = 3
const BLADE_BASE_WIDTH = 0.14
const BLADE_TAPER = 0.85
const BLADE_CURVE = 0.55
const BLADE_HEIGHT_RANGE = { min: 0.6, max: 1 }
const TUFT_SPREAD_RATIO = 0.8
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Deterministic: blade k of every tuft is placed by the golden angle, so no randomness is needed. */
export function createTuftGeometry() {
  const positions: number[] = []
  const indices: number[] = []
  for (let blade = 0; blade < TUFT_BLADES; blade += 1) {
    const angle = blade * GOLDEN_ANGLE
    const radius = Math.sqrt((blade + 0.5) / TUFT_BLADES) * TUFT_SPREAD_RATIO
    const originX = Math.cos(angle) * radius
    const originZ = Math.sin(angle) * radius
    const height = BLADE_HEIGHT_RANGE.min + (BLADE_HEIGHT_RANGE.max - BLADE_HEIGHT_RANGE.min) * ((blade * 0.618) % 1)
    const sideX = -Math.sin(angle)
    const sideZ = Math.cos(angle)
    const first = positions.length / 3
    for (let level = 0; level <= BLADE_SEGMENTS; level += 1) {
      const t = level / BLADE_SEGMENTS
      const bend = BLADE_CURVE * t * t * (1 + radius)
      const x = originX + Math.cos(angle) * bend
      const z = originZ + Math.sin(angle) * bend
      const y = t * height
      if (level === BLADE_SEGMENTS) {
        positions.push(x, y, z)
        indices.push(first + level * 2 - 2, first + level * 2 - 1, first + level * 2)
      } else {
        const half = (BLADE_BASE_WIDTH * (1 - BLADE_TAPER * t)) / 2
        positions.push(x - sideX * half, y, z - sideZ * half, x + sideX * half, y, z + sideZ * half)
        if (level > 0) {
          const below = first + (level - 1) * 2
          indices.push(below, below + 1, below + 2, below + 1, below + 3, below + 2)
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const normals = new Float32Array(positions.length)
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setIndex(indices)
  return geometry
}
