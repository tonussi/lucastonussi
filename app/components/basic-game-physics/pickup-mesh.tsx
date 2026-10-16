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
const GLOW_INTENSITY = 0.6

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
    <mesh ref={body} position={[0, PICKUP_HEIGHT, 0]} castShadow onClick={onClick}>
      <octahedronGeometry args={[PICKUP_SIZE, 0]} />
      <meshStandardMaterial
        color={itemColor}
        emissive={selected ? '#ffffff' : itemColor}
        emissiveIntensity={selected ? 0.8 : GLOW_INTENSITY}
        roughness={0.3}
      />
    </mesh>
  )
}
