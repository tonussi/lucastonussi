import * as THREE from 'three'

export const maps: Record<string, { scale: number; position: THREE.Vector3 }> = {
  desert: {
    scale: 0.1,
    position: new THREE.Vector3(-4, 0, -6),
  },
}
