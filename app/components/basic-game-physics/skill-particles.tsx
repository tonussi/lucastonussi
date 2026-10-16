import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CombatVisual } from './combat-visual'

/** Skill effect example: a short burst of embers that fly forward from the character. */
const SKILL_EFFECT = {
  count: 70,
  lifetime: 0.9,
  speed: 5,
  spread: 1.2,
  gravity: -2,
  size: 0.18,
  color: '#ff8a3d',
  origin: [0, 1.1, 0.9] as [number, number, number],
}
const FLOATS_PER_PARTICLE = 3

export default function SkillParticles({ combat }: { combat: CombatVisual }) {
  const { count, lifetime, speed, spread, gravity, size, color, origin } = SKILL_EFFECT
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.PointsMaterial>(null)
  const age = useRef(lifetime)
  const seenSerial = useRef(combat.skillSerial)
  const positions = useMemo(() => new Float32Array(count * FLOATS_PER_PARTICLE), [count])
  const velocities = useMemo(() => new Float32Array(count * FLOATS_PER_PARTICLE), [count])
  const geometry = useMemo(() => {
    const built = new THREE.BufferGeometry()
    built.setAttribute('position', new THREE.BufferAttribute(positions, FLOATS_PER_PARTICLE))
    return built
  }, [positions])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    if (seenSerial.current !== combat.skillSerial) {
      seenSerial.current = combat.skillSerial
      age.current = 0
      for (let particle = 0; particle < count; particle += 1) {
        const offset = particle * FLOATS_PER_PARTICLE
        positions[offset] = origin[0]
        positions[offset + 1] = origin[1]
        positions[offset + 2] = origin[2]
        velocities[offset] = (Math.random() - 0.5) * spread * 2
        velocities[offset + 1] = Math.random() * spread
        velocities[offset + 2] = speed * (0.5 + Math.random() * 0.5)
      }
    }
    const visible = age.current < lifetime
    if (points.current) points.current.visible = visible
    if (!visible) return
    age.current += delta
    for (let particle = 0; particle < count; particle += 1) {
      const offset = particle * FLOATS_PER_PARTICLE
      velocities[offset + 1] += gravity * delta
      positions[offset] += velocities[offset] * delta
      positions[offset + 1] += velocities[offset + 1] * delta
      positions[offset + 2] += velocities[offset + 2] * delta
    }
    geometry.attributes.position.needsUpdate = true
    if (material.current) material.current.opacity = Math.max(0, 1 - age.current / lifetime)
  })

  return (
    <points ref={points} geometry={geometry} visible={false} frustumCulled={false}>
      <pointsMaterial
        ref={material}
        color={color}
        size={size}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
