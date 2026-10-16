import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generatePath } from '../game-engine/path-generator'
import type { PathSettings } from '../game-engine/types'

interface PathMeshProps {
  settings: PathSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function PathMesh({ settings, color, selected, onClick }: PathMeshProps) {
  const { length, width, wiggle, seed } = settings
  const geometry = useMemo(() => {
    const { positions, indices } = generatePath({ length, width, wiggle, seed })
    const built = new THREE.BufferGeometry()
    built.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    built.setIndex(new THREE.BufferAttribute(indices, 1))
    built.computeVertexNormals()
    return built
  }, [length, width, wiggle, seed])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} receiveShadow onClick={onClick}>
      <meshStandardMaterial
        color={color}
        roughness={1}
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.4 : 0}
      />
    </mesh>
  )
}
