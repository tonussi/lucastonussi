import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { itemById } from '../game-engine/items'
import type { PickupSettings } from '../game-engine/types'

const PICKUP_SIZE = 0.35
const PICKUP_HEIGHT = 0.7
const BOB_AMPLITUDE = 0.12
const BOB_SPEED = 2
const SPIN_SPEED = 1.2
const GLOW_INTENSITY = 2.5
const HALO_RESOLUTION = 32
const haloPixels = new Uint8Array(HALO_RESOLUTION * HALO_RESOLUTION * 4)
for (let y = 0; y < HALO_RESOLUTION; y++) for (let x = 0; x < HALO_RESOLUTION; x++) {
  const offset = (y * HALO_RESOLUTION + x) * 4
  const radius = Math.hypot((x + 0.5) / HALO_RESOLUTION * 2 - 1, (y + 0.5) / HALO_RESOLUTION * 2 - 1)
  haloPixels.set([255, 255, 255, Math.round(Math.max(0, 1 - radius) ** 2 * 255)], offset)
}
const haloTexture = new THREE.DataTexture(haloPixels, HALO_RESOLUTION, HALO_RESOLUTION)
haloTexture.needsUpdate = true

interface PickupMeshProps {
  settings: PickupSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function PickupMesh({ settings, color, selected, onClick }: PickupMeshProps) {
  const body = useRef<THREE.Mesh>(null)
  const itemColor = itemById(settings.itemId)?.color ?? color

  useFrame(({ clock }) => {
    if (!body.current) return
    body.current.position.y = PICKUP_HEIGHT + Math.sin(clock.elapsedTime * BOB_SPEED) * BOB_AMPLITUDE
    body.current.rotation.y = clock.elapsedTime * SPIN_SPEED
  })

  return (
    <group onClick={onClick}>
    <sprite position={[0, PICKUP_HEIGHT, 0]} scale={[1.3, 1.3, 1.3]}>
      <spriteMaterial map={haloTexture} color={itemColor} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
    <mesh ref={body} position={[0, PICKUP_HEIGHT, 0]} castShadow onClick={onClick}>
      <octahedronGeometry args={[PICKUP_SIZE, 0]} />
      <meshStandardMaterial
        color={itemColor}
        emissive={selected ? '#ffffff' : itemColor}
        emissiveIntensity={selected ? 0.8 : GLOW_INTENSITY}
        roughness={0.3}
        toneMapped={false}
      />
    </mesh>
    </group>
  )
}
