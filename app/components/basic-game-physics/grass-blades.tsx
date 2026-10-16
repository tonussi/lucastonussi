import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GrassBlade } from '../game-engine/grass-generator'

const BLADE_SEGMENTS = 3

const matrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const scale = new THREE.Vector3()
const quaternion = new THREE.Quaternion()
const euler = new THREE.Euler(0, 0, 0, 'YXZ')
const baseColor = new THREE.Color()
const bladeColor = new THREE.Color()

const bladeGeometry = new THREE.ConeGeometry(1, 1, BLADE_SEGMENTS).translate(0, 0.5, 0)

interface GrassBladesProps {
  blades: GrassBlade[]
  color: string
  selected: boolean
}

export default function GrassBlades({ blades, color, selected }: GrassBladesProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const instances = mesh.current
    if (!instances) return
    baseColor.set(color)
    blades.forEach((blade, index) => {
      position.set(...blade.position)
      euler.set(blade.lean, blade.yaw, 0)
      quaternion.setFromEuler(euler)
      scale.set(blade.width, blade.height, blade.width)
      matrix.compose(position, quaternion, scale)
      instances.setMatrixAt(index, matrix)
      instances.setColorAt(index, bladeColor.copy(baseColor).multiplyScalar(blade.shade))
    })
    instances.instanceMatrix.needsUpdate = true
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true
    instances.computeBoundingSphere()
  }, [blades, color])

  if (blades.length === 0) return null

  return (
    <instancedMesh key={blades.length} ref={mesh} args={[bladeGeometry, undefined, blades.length]} receiveShadow>
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.9}
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.5 : 0}
      />
    </instancedMesh>
  )
}
