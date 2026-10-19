import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateGrassPlane } from '../game-engine/grass-plane-generator'
import type { GrassPlaneSettings } from '../game-engine/types'
import GrassBlades from './grass-blades'

const SOIL_COLOR = new THREE.Color('#7a6648')
/** Share of its own color the vertical sides emit, so cliff faces never render black in shadow. */
const SIDE_SELF_LIGHT = 0.6

function lightSides(shader: { vertexShader: string; fragmentShader: string }) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying float vSideFace;')
    .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvSideFace = 1.0 - abs(objectNormal.y);')
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vSideFace;')
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vSideFace * ${SIDE_SELF_LIGHT.toFixed(2)};`)
}
const TOP_SURFACE_DARKEN = 0.8
const topColor = new THREE.Color()

interface GrassPlaneMeshProps {
  settings: GrassPlaneSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function GrassPlaneMesh({ settings, color, selected, onClick }: GrassPlaneMeshProps) {
  const settingsKey = JSON.stringify(settings)
  const { slab, ramp, blades } = useMemo(() => {
    const { positions, indices, topVertexCount, blades: generatedBlades, rampPositions, rampIndices } = generateGrassPlane(settings)
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
    const bank = new THREE.BufferGeometry()
    bank.setAttribute('position', new THREE.BufferAttribute(rampPositions, 3))
    const bankColors = new Float32Array(rampPositions.length)
    for (let vertex = 0; vertex < rampPositions.length / 3; vertex += 1) topColor.toArray(bankColors, vertex * 3)
    bank.setAttribute('color', new THREE.BufferAttribute(bankColors, 3))
    bank.setIndex(new THREE.BufferAttribute(rampIndices, 1))
    bank.computeVertexNormals()
    return { slab: flat, ramp: rampIndices.length > 0 ? bank : undefined, blades: generatedBlades }
  }, [settingsKey, color])

  useEffect(() => () => { slab.dispose(); ramp?.dispose() }, [slab, ramp])

  return (
    <group onClick={onClick}>
      <mesh geometry={slab} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          onBeforeCompile={lightSides}
          roughness={1}
          emissive={selected ? '#8a631e' : '#000000'}
          emissiveIntensity={selected ? 0.4 : 0}
        />
      </mesh>
      {ramp && (
        <mesh geometry={ramp} receiveShadow>
          <meshStandardMaterial vertexColors roughness={1} emissive={selected ? '#8a631e' : '#000000'} emissiveIntensity={selected ? 0.4 : 0} />
        </mesh>
      )}
      <GrassBlades blades={blades} color={color} selected={selected} />
    </group>
  )
}
