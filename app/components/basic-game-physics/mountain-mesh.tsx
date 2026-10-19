import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateMountain } from '../game-engine/mountain-generator'
import type { MountainSettings, GrassSettings } from '../game-engine/types'
import GrassBlades from './grass-blades'
import { createGrassBlade, clampGrassSettings } from '../game-engine/grass-generator'
import { createRandom } from '../game-engine/seeded-random'

const SNOW_COLOR = new THREE.Color('#f4f7fa')
const SNOW_BLEND_RATIO = 0.12
const rockColor = new THREE.Color()
const vertexColor = new THREE.Color()

interface MountainMeshProps {
  settings: MountainSettings
  grass?: GrassSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function MountainMesh({ settings, grass, color, selected, onClick }: MountainMeshProps) {
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
  const blades = useMemo(() => {
    const surfaceColor = new THREE.Color(color)
    if (snowLine < 1 || surfaceColor.g <= surfaceColor.r || surfaceColor.g <= surfaceColor.b) return []
    const cover = clampGrassSettings(grass ?? { bladeCount: 7200, height: 0.22 })
    const random = createRandom(seed)
    const vertices = geometry.getAttribute('position')
    const indices = geometry.index!
    const blades = []
    for (let sample = 0; sample < cover.bladeCount; sample++) {
      const i = Math.floor(random() * (indices.count / 3)) * 3
      const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2)
      const u = Math.sqrt(random()), v = random()
      const wa = 1 - u, wb = u * (1 - v), wc = u * v
      const x = vertices.getX(a) * wa + vertices.getX(b) * wb + vertices.getX(c) * wc
      const z = vertices.getZ(a) * wa + vertices.getZ(b) * wb + vertices.getZ(c) * wc
      if (Math.hypot(x, z) > radius) continue
      const blade = createGrassBlade(random, x, z, cover.height)
      blade.position[1] = vertices.getY(a) * wa + vertices.getY(b) * wb + vertices.getY(c) * wc
      blades.push(blade)
    }
    return blades
  }, [geometry, seed, snowLine, radius, grass, color])

  return (
    <group onClick={onClick}><mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        flatShading
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.4 : 0}
      />
    </mesh><GrassBlades blades={blades} color={color} selected={selected} /></group>
  )
}
