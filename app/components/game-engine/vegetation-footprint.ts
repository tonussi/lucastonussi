import * as THREE from 'three'
import { clampHouseSettings } from './house-layout.ts'
import { generateWater } from './water-generator.ts'
import type { EngineSceneObject } from './types.ts'

export function createVegetationMask(objects: EngineSceneObject[]) {
  const footprints = objects.filter(o => o.visible && (o.kind === 'house' || o.kind === 'water')).map(o => {
    const inverse = new THREE.Matrix4().compose(new THREE.Vector3(...o.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...o.rotation)), new THREE.Vector3(...o.scale)).invert()
    const house = o.kind === 'house' ? clampHouseSettings(o.house) : undefined
    const water = o.kind === 'water' ? generateWater(o.water ?? {}) : undefined
    const bounds = new THREE.Box3()
    if (water) for (let i = 0; i < water.positions.length; i += 3) bounds.expandByPoint(new THREE.Vector3(water.positions[i], 0, water.positions[i + 2]))
    return { inverse, house, water, bounds }
  })
  const p = new THREE.Vector3()
  return (point: THREE.Vector3) => footprints.some(({ inverse, house, water, bounds }) => {
    p.copy(point).applyMatrix4(inverse)
    if (house) return Math.abs(p.x) <= house.width / 2 && Math.abs(p.z) <= house.depth / 2
    if (!water) return false
    if (p.x < bounds.min.x || p.x > bounds.max.x || p.z < bounds.min.z || p.z > bounds.max.z) return false
    const { positions: v, indices } = water
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3
      const side = (u: number, w: number) => (p.x - v[w]) * (v[u + 2] - v[w + 2]) - (v[u] - v[w]) * (p.z - v[w + 2])
      const s1 = side(a, b), s2 = side(b, c), s3 = side(c, a)
      if (!((s1 < 0 || s2 < 0 || s3 < 0) && (s1 > 0 || s2 > 0 || s3 > 0))) return true
    }
    return false
  })
}
