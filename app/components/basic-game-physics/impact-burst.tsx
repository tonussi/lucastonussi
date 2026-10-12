import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface ImpactBurstProps {
  position: [number, number, number]
  onComplete: () => void
}

export default function ImpactBurst({ position, onComplete }: ImpactBurstProps) {
  const particles = useRef<Array<THREE.Mesh | null>>([])
  const elapsed = useRef(0)
  const completed = useRef(false)
  const velocities = useMemo(
    () =>
      Array.from({ length: 18 }, () => {
        const angle = Math.random() * Math.PI * 2
        const horizontalSpeed = 2.8 + Math.random() * 4.2
        return new THREE.Vector3(
          Math.cos(angle) * horizontalSpeed,
          2.5 + Math.random() * 5,
          Math.sin(angle) * horizontalSpeed,
        )
      }),
    [],
  )

  useFrame((_, delta) => {
    elapsed.current += delta
    const time = elapsed.current
    const life = Math.max(0, 1 - time / 0.72)

    particles.current.forEach((particle, index) => {
      if (!particle) return
      const velocity = velocities[index]
      particle.position.set(
        velocity.x * time,
        velocity.y * time - 8.5 * time * time,
        velocity.z * time,
      )
      particle.rotation.x += delta * (5 + index * 0.13)
      particle.rotation.y += delta * (7 + index * 0.09)
      particle.scale.setScalar(life * (0.65 + (index % 4) * 0.12))
    })

    if (time >= 0.72 && !completed.current) {
      completed.current = true
      onComplete()
    }
  })

  return (
    <group position={position}>
      {velocities.map((_, index) => (
        <mesh
          key={index}
          ref={(particle) => {
            particles.current[index] = particle
          }}
          scale={0.16}
        >
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color="#ffd15c"
            emissive="#c47716"
            emissiveIntensity={1.5}
            roughness={0.35}
          />
        </mesh>
      ))}
      <pointLight color="#ffbd45" intensity={7} distance={5} decay={2} />
    </group>
  )
}
