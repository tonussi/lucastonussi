import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

const PREVIEW_SIZE = 1
const SPIN_SPEED = 0.8
const PREVIEW_CAMERA = { position: [0, 0.6, 3.2] as [number, number, number], fov: 40 }
const AMBIENT_INTENSITY = 0.8
const KEY_LIGHT_INTENSITY = 2.5
const KEY_LIGHT_POSITION: [number, number, number] = [3, 4, 3]

function SpinningItem({ color }: { color: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * SPIN_SPEED
  })
  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[PREVIEW_SIZE, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} />
    </mesh>
  )
}

/** Own Canvas, mounted only while the inspect dialog is open; never part of the game scene. */
export default function ItemPreview({ color }: { color: string }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={PREVIEW_CAMERA}>
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={KEY_LIGHT_POSITION} intensity={KEY_LIGHT_INTENSITY} />
      <SpinningItem color={color} />
    </Canvas>
  )
}
