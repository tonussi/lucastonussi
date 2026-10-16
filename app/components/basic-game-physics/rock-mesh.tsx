import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateRockBumps, ROCK_DETAIL, rockSurfacePoint } from '../game-engine/rock-generator'
import type { RockSettings } from '../game-engine/types'

interface RockMeshProps {
  settings: RockSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function RockMesh({ settings, color, selected, onClick }: RockMeshProps) {
  const { size, roughness, flatness, elongation, seed } = settings
  const geometry = useMemo(() => {
    const built = new THREE.IcosahedronGeometry(1, ROCK_DETAIL)
    const bumps = generateRockBumps(seed)
    const positions = built.attributes.position
    const direction = new THREE.Vector3()
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      direction.fromBufferAttribute(positions, vertex).normalize()
      const [x, y, z] = rockSurfacePoint([direction.x, direction.y, direction.z], { size, roughness, flatness, elongation, seed }, bumps)
      positions.setXYZ(vertex, x, y, z)
    }
    built.translate(0, size * flatness, 0)
    built.computeVertexNormals()
    return built
  }, [size, roughness, flatness, elongation, seed])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} castShadow receiveShadow onClick={onClick}>
      <meshStandardMaterial
        color={color}
        roughness={1}
        flatShading
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.4 : 0}
      />
    </mesh>
  )
}
