import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GrassBlade } from '../game-engine/grass-generator'
import { applyGrassWind } from './grass-wind'
import { createTuftGeometry, TUFT_RADIUS } from './grass-tuft'
import { useVegetationMask } from './vegetation-mask'

const matrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const scale = new THREE.Vector3()
const quaternion = new THREE.Quaternion()
const euler = new THREE.Euler(0, 0, 0, 'YXZ')
const baseColor = new THREE.Color()
const bladeColor = new THREE.Color()

const bladeGeometry = createTuftGeometry()

interface GrassBladesProps {
  blades: GrassBlade[]
  color: string
  selected: boolean
}

export default function GrassBlades({ blades, color, selected }: GrassBladesProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const blocked = useVegetationMask()

  useLayoutEffect(() => {
    const instances = mesh.current
    if (!instances) return
    baseColor.set(color)
    instances.updateWorldMatrix(true, false)
    const worldPoint = new THREE.Vector3()
    let count = 0
    blades.forEach((blade) => {
      position.set(...blade.position)
      worldPoint.copy(position).applyMatrix4(instances.matrixWorld)
      if (blocked(worldPoint)) return
      euler.set(0, blade.yaw, 0)
      quaternion.setFromEuler(euler)
      scale.set(TUFT_RADIUS, blade.height, TUFT_RADIUS)
      matrix.compose(position, quaternion, scale)
      instances.setMatrixAt(count, matrix)
      instances.setColorAt(count++, bladeColor.copy(baseColor).multiplyScalar(blade.shade))
    })
    instances.count = count
    instances.instanceMatrix.needsUpdate = true
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true
    instances.computeBoundingSphere()
  }, [blades, color, blocked])

  if (blades.length === 0) return null

  return (
    <instancedMesh key={blades.length} ref={mesh} args={[bladeGeometry, undefined, blades.length]} receiveShadow>
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.9}
        side={THREE.DoubleSide}
        onBeforeCompile={applyGrassWind}
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.5 : 0}
      />
    </instancedMesh>
  )
}
