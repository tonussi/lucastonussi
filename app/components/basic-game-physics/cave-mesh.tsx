import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { generateCave } from '../game-engine/cave-generator'
import type { CaveSettings } from '../game-engine/types'

const ROCK_DETAIL = 0

const matrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const scale = new THREE.Vector3()
const quaternion = new THREE.Quaternion()
const euler = new THREE.Euler()

interface CaveMeshProps {
  settings: CaveSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function CaveMesh({ settings, color, selected, onClick }: CaveMeshProps) {
  const { radius, depth, seed } = settings
  const { rocks } = useMemo(() => generateCave({ radius, depth, seed }), [radius, depth, seed])
  const mesh = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const instances = mesh.current
    if (!instances) return
    rocks.forEach((rock, index) => {
      position.set(...rock.position)
      euler.set(...rock.rotation)
      quaternion.setFromEuler(euler)
      scale.set(...rock.scale)
      matrix.compose(position, quaternion, scale)
      instances.setMatrixAt(index, matrix)
    })
    instances.instanceMatrix.needsUpdate = true
    instances.computeBoundingSphere()
  }, [rocks])

  return (
    <group onClick={onClick}>
      <instancedMesh
        key={rocks.length}
        ref={mesh}
        args={[undefined, undefined, rocks.length]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, ROCK_DETAIL]} />
        <meshStandardMaterial
          color={color}
          roughness={1}
          flatShading
          emissive={selected ? '#8a631e' : '#000000'}
          emissiveIntensity={selected ? 0.5 : 0}
        />
      </instancedMesh>
    </group>
  )
}
