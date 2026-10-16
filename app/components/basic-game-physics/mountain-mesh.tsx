import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateMountain } from '../game-engine/mountain-generator'
import type { MountainSettings } from '../game-engine/types'

const SNOW_COLOR = new THREE.Color('#f4f7fa')
const SNOW_BLEND_RATIO = 0.12
const rockColor = new THREE.Color()
const vertexColor = new THREE.Color()

interface MountainMeshProps {
  settings: MountainSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function MountainMesh({ settings, color, selected, onClick }: MountainMeshProps) {
  const { height, radius, peakCount, roughness, snowLine, seed } = settings
  const geometry = useMemo(() => {
    const { positions, indices, peakHeight } = generateMountain({ height, radius, peakCount, roughness, seed })
    const colors = new Float32Array(positions.length)
    const snowStart = peakHeight * snowLine
    const snowBlend = Math.max(peakHeight * SNOW_BLEND_RATIO, 1e-6)
    rockColor.set(color)
    for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
      const snow = THREE.MathUtils.clamp((positions[vertex * 3 + 1] - snowStart) / snowBlend, 0, 1)
      vertexColor.copy(rockColor).lerp(SNOW_COLOR, snow)
      vertexColor.toArray(colors, vertex * 3)
    }
    const built = new THREE.BufferGeometry()
    built.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    built.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    built.setIndex(new THREE.BufferAttribute(indices, 1))
    built.computeVertexNormals()
    return built
  }, [height, radius, peakCount, roughness, snowLine, seed, color])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} castShadow receiveShadow onClick={onClick}>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        flatShading
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.4 : 0}
      />
    </mesh>
  )
}
