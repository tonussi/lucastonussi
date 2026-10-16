import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateWater } from '../game-engine/water-generator'
import type { WaterSettings } from '../game-engine/types'

const WATER_OPACITY = 0.78

interface WaterMeshProps {
  settings: WaterSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function WaterMesh({ settings, color, selected, onClick }: WaterMeshProps) {
  const { shape, size, width, wiggle, seed } = settings
  const geometry = useMemo(() => {
    const { positions, indices } = generateWater({ shape, size, width, wiggle, seed })
    const built = new THREE.BufferGeometry()
    built.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    built.setIndex(new THREE.BufferAttribute(indices, 1))
    built.computeVertexNormals()
    return built
  }, [shape, size, width, wiggle, seed])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} receiveShadow onClick={onClick}>
      <meshStandardMaterial
        color={color}
        roughness={0.15}
        metalness={0.3}
        transparent
        opacity={WATER_OPACITY}
        side={THREE.DoubleSide}
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.4 : 0}
      />
    </mesh>
  )
}
