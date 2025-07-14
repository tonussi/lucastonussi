import * as THREE from 'three'

export const maps: Record<string, { scale: number; position: THREE.Vector3 }> = {
  medieval_fantasy_book: {
    scale: 0.4,
    position: new THREE.Vector3(-4, 0, -6),
  },
  big_city: {
    scale: 0.8,
    position: new THREE.Vector3(0, 100, 0),
  },
}
