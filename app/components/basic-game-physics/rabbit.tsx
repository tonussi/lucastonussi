import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const RABBIT_MODEL_PATH = '/assets/consolidated/props/rabbit/rabbit.glb'
const MODEL_HALF_HEIGHT = 0.5
const RABBIT_SCALE = 1
const FEET_OFFSET_Y = -0.25
const MODEL_YAW = 0
const HOP_FREQUENCY = 9
const HOP_HEIGHT = 0.12
const HOP_SQUASH = 0.06
const SETTLE_SPEED = 12

export const RABBIT_ANIMATION = { idle: 0, moving: 1 } as const

function Rabbit({ animation }: { animation: number }) {
  const scale = RABBIT_SCALE
  const hopper = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(RABBIT_MODEL_PATH)
  const model = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [model])

  useFrame(({ clock }, delta) => {
    const group = hopper.current
    if (animation === RABBIT_ANIMATION.moving) {
      const phase = Math.abs(Math.sin(clock.elapsedTime * HOP_FREQUENCY))
      group.position.y = phase * HOP_HEIGHT * scale
      group.scale.setScalar(1)
      group.scale.y = 1 + (1 - phase) * HOP_SQUASH
      return
    }
    const settle = Math.min(1, delta * SETTLE_SPEED)
    group.position.y = THREE.MathUtils.lerp(group.position.y, 0, settle)
    group.scale.y = THREE.MathUtils.lerp(group.scale.y, 1, settle)
  })

  return (
    <group position-y={FEET_OFFSET_Y}>
      <group name="rabbit-group" ref={hopper} dispose={null}>
        <primitive
          name="rabbit"
          object={model}
          scale={scale}
          position-y={MODEL_HALF_HEIGHT * scale}
          rotation-y={MODEL_YAW}
        />
      </group>
    </group>
  )
}

useGLTF.preload(RABBIT_MODEL_PATH)

export default Rabbit
