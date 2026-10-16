import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { CombatVisual } from './combat-visual'

const SWORD_PIVOT: [number, number, number] = [0.5, 1.2, 0.1]
const SWORD_REST_PITCH = -0.35
const SWORD_SWING_FROM = -1.5
const SWORD_SWING_TO = 1.3
const STRONG_WINDUP_PITCH = -2.4
const STRONG_WINDUP_SHARE = 0.45
const SPIN_AMOUNT = Math.PI * 0.6
const BLADE_SIZE: [number, number, number] = [0.08, 1.1, 0.03]
const HILT_SIZE: [number, number, number] = [0.3, 0.06, 0.06]
const GRIP_SIZE: [number, number, number] = [0.06, 0.3, 0.06]
const SHIELD_REST: [number, number, number] = [-0.5, 1.1, 0.2]
const SHIELD_GUARD: [number, number, number] = [0, 1.15, 0.55]
const SHIELD_SIZE: [number, number, number] = [0.55, 0.75, 0.07]
const SHIELD_LERP = 0.25
const BLADE_COLOR = '#c9ced6'
const HILT_COLOR = '#8a6a3a'
const SHIELD_COLOR = '#a87a4a'

const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

interface EquipmentRigProps {
  combat: CombatVisual
  equipment: { sword: boolean; shield: boolean }
}

export default function EquipmentRig({ combat, equipment }: EquipmentRigProps) {
  const sword = useRef<THREE.Group>(null)
  const shield = useRef<THREE.Group>(null)

  useFrame(() => {
    if (sword.current) {
      const { action, progress } = combat
      let pitch = SWORD_REST_PITCH
      let spin = 0
      if (action === 'attack') {
        pitch = SWORD_SWING_FROM + (SWORD_SWING_TO - SWORD_SWING_FROM) * easeOut(progress)
      } else if (action === 'strongAttack') {
        if (progress < STRONG_WINDUP_SHARE) {
          pitch = SWORD_REST_PITCH + (STRONG_WINDUP_PITCH - SWORD_REST_PITCH) * (progress / STRONG_WINDUP_SHARE)
        } else {
          const swing = (progress - STRONG_WINDUP_SHARE) / (1 - STRONG_WINDUP_SHARE)
          pitch = STRONG_WINDUP_PITCH + (SWORD_SWING_TO - STRONG_WINDUP_PITCH) * easeOut(swing)
          spin = SPIN_AMOUNT * swing
        }
      }
      sword.current.rotation.x = pitch
      sword.current.rotation.y = spin
    }
    if (shield.current) {
      const target = combat.guarding ? SHIELD_GUARD : SHIELD_REST
      shield.current.position.x += (target[0] - shield.current.position.x) * SHIELD_LERP
      shield.current.position.y += (target[1] - shield.current.position.y) * SHIELD_LERP
      shield.current.position.z += (target[2] - shield.current.position.z) * SHIELD_LERP
    }
  })

  return (
    <>
      {equipment.sword && (
        <group ref={sword} position={SWORD_PIVOT}>
          <mesh position={[0, GRIP_SIZE[1] / 2, 0]} castShadow>
            <boxGeometry args={GRIP_SIZE} />
            <meshStandardMaterial color={HILT_COLOR} roughness={0.8} />
          </mesh>
          <mesh position={[0, GRIP_SIZE[1], 0]} castShadow>
            <boxGeometry args={HILT_SIZE} />
            <meshStandardMaterial color={HILT_COLOR} roughness={0.8} />
          </mesh>
          <mesh position={[0, GRIP_SIZE[1] + BLADE_SIZE[1] / 2, 0]} castShadow>
            <boxGeometry args={BLADE_SIZE} />
            <meshStandardMaterial color={BLADE_COLOR} roughness={0.25} metalness={0.8} />
          </mesh>
        </group>
      )}
      {equipment.shield && (
        <group ref={shield} position={SHIELD_REST}>
          <mesh castShadow>
            <boxGeometry args={SHIELD_SIZE} />
            <meshStandardMaterial color={SHIELD_COLOR} roughness={0.7} />
          </mesh>
        </group>
      )}
    </>
  )
}
