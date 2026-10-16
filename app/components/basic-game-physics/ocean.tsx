import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { generateOceanWaves } from '../game-engine/ocean-generator'
import type { OceanSettings } from '../game-engine/types'

function Ocean({
  settings,
  color,
  onClick,
}: {
  settings: OceanSettings
  color: string
  onClick?: (event: { stopPropagation: () => void }) => void
}) {
  const { size, segments } = settings
  const geometryRef = useRef<THREE.PlaneGeometry>(null)
  const basePositions = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = new Float32Array(geometry.attributes.position.array)
    geometry.dispose()
    return positions
  }, [size, segments])
  const { waveCount, amplitude, windDirection, seed } = settings
  const waves = useMemo(
    () => generateOceanWaves({ size, segments, waveCount, amplitude, windDirection, seed }),
    [size, segments, waveCount, amplitude, windDirection, seed],
  )

  useFrame(({ clock }) => {
    const positions = geometryRef.current?.attributes.position
    if (!positions) return

    const time = clock.getElapsedTime()
    for (let index = 0; index < positions.count; index += 1) {
      const x = basePositions[index * 3]
      const y = basePositions[index * 3 + 1]
      let height = 0
      let offsetX = 0
      let offsetZ = 0

      for (const wave of waves) {
        // The plane's local Y axis maps to negative world Z after its rotation.
        const phase =
          (x * wave.directionX - y * wave.directionZ) * wave.frequency -
          time * wave.speed +
          wave.phase
        const crest = Math.cos(phase)
        height += Math.sin(phase) * wave.amplitude
        offsetX += crest * wave.directionX * wave.steepness
        offsetZ += crest * wave.directionZ * wave.steepness
      }

      positions.setXYZ(index, x + offsetX, y - offsetZ, height)
    }
    positions.needsUpdate = true
    geometryRef.current?.computeVertexNormals()
  })

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow onClick={onClick}>
      <planeGeometry
        ref={geometryRef}
        args={[size, size, segments, segments]}
      />
      <meshStandardMaterial color={color} roughness={0.18} metalness={0.28} />
    </mesh>
  )
}

export default Ocean
