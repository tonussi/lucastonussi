import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateGrassPlane } from '../game-engine/grass-plane-generator'
import type { GrassPlaneSettings } from '../game-engine/types'
import GrassBlades from './grass-blades'

const SOIL_COLOR = new THREE.Color('#5a4630')
const TOP_SURFACE_DARKEN = 0.55
const topColor = new THREE.Color()

interface GrassPlaneMeshProps {
  settings: GrassPlaneSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function GrassPlaneMesh({ settings, color, selected, onClick }: GrassPlaneMeshProps) {
  const { width, depth, thickness, bladeCount, bladeHeight, shapeRandomness, seed } = settings
  const { slab, blades } = useMemo(() => {
    const { positions, indices, topVertexCount, blades: generatedBlades } = generateGrassPlane({
      width, depth, thickness, bladeCount, bladeHeight, shapeRandomness, seed,
    })
    topColor.set(color).multiplyScalar(TOP_SURFACE_DARKEN)
    const vertexCount = positions.length / 3
    const colors = new Float32Array(positions.length)
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const isTop = vertex < topVertexCount || vertex === vertexCount - 2
      ;(isTop ? topColor : SOIL_COLOR).toArray(colors, vertex * 3)
    }
    const indexed = new THREE.BufferGeometry()
    indexed.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    indexed.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    indexed.setIndex(new THREE.BufferAttribute(indices, 1))
    const flat = indexed.toNonIndexed()
    indexed.dispose()
    flat.computeVertexNormals()
    return { slab: flat, blades: generatedBlades }
  }, [width, depth, thickness, bladeCount, bladeHeight, shapeRandomness, seed, color])

  useEffect(() => () => slab.dispose(), [slab])

  return (
    <group onClick={onClick}>
      <mesh geometry={slab} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={1}
          emissive={selected ? '#8a631e' : '#000000'}
          emissiveIntensity={selected ? 0.4 : 0}
        />
      </mesh>
      <GrassBlades blades={blades} color={color} selected={selected} />
    </group>
  )
}
