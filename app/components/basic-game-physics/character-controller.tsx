import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier'
import { useControls } from 'leva'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { degToRad, MathUtils } from 'three/src/math/MathUtils.js'
import type { GamepadState } from './gamepad'
import Pirate from './pirate'

const normalizeAngle = (angle: number) => {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

const lerpAngle = (start: number, end: number, t: number) => {
  start = normalizeAngle(start)
  end = normalizeAngle(end)

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI
    } else {
      end += 2 * Math.PI
    }
  }

  return normalizeAngle(start + (end - start) * t)
}

export const CharacterController = ({
  refScene,
  gamepad,
}: {
  refScene: React.RefObject<THREE.Scene>
  gamepad: GamepadState
}) => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, JUMP_FORCE } = useControls('Character Control', {
    WALK_SPEED: { value: 2, min: 0.1, max: 4, step: 0.1 },
    RUN_SPEED: { value: 5, min: 0.2, max: 12, step: 0.1 },
    ROTATION_SPEED: {
      value: degToRad(0),
      min: degToRad(0.1),
      max: degToRad(5),
      step: degToRad(0.1),
    },
    JUMP_FORCE: { value: 24, min: 1, max: 60, step: 0.5 },
  })
  const { cameraTargetPositionZ, cameraPositionY, cameraPositionZ } = useControls(
    'Camera Control',
    {
      cameraTargetPositionZ: { value: 5.5, min: -20, max: 20, step: 1 },
      cameraPositionY: { value: 6, min: -20, max: 20, step: 1 },
      cameraPositionZ: { value: -10, min: -20, max: 20, step: 1 },
    }
  )
  const rb = useRef<any>(null!)
  const container = useRef<THREE.Group>(null!)
  const character = useRef<THREE.Group>(null!)

  const [animationIndex, setAnimationIndex] = useState(0)

  const characterRotationTarget = useRef(0)
  const rotationTarget = useRef(0)
  const cameraTarget = useRef<THREE.Group>(null!)
  const cameraPosition = useRef<THREE.Group>(null!)
  const cameraWorldPosition = useRef(new Vector3())
  const cameraLookAtWorldPosition = useRef(new Vector3())
  const cameraLookAt = useRef(new Vector3())
  const [, get] = useKeyboardControls()

  // Jump state
  const grounded = useRef(true)
  const jumpCooldown = useRef(0)
  const prevYPressed = useRef(false)
  const rapierRay = useRef<any>(null)
  const { world, rapier } = useRapier()

  useFrame(({ camera }) => {
    if (rb.current) {
      const vel = rb.current.linvel()

      const movement = {
        x: 0,
        z: 0,
      }

      // Keyboard
      if (get().forward) movement.z += 1
      if (get().backward) movement.z -= 1
      if (get().left) movement.x += 1
      if (get().right) movement.x -= 1

      // Gamepad (left stick) — X inverted, Y as before (up = forward)
      movement.z += -gamepad.leftStickY
      movement.x += -gamepad.leftStickX

      const runFromTrigger = gamepad.b
      const run = !!(get().run || runFromTrigger)
      const speed = run ? RUN_SPEED : WALK_SPEED

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * Math.sign(movement.x)
      }

      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z)
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed
        setAnimationIndex(1)
      } else {
        setAnimationIndex(0)
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      )

      rb.current.setLinvel(vel, true)

      // GROUNDED CHECK — native rapier raycast (broadphase-optimized, no mesh traversal)
      const t = rb.current.translation()
      if (!rapierRay.current) {
        rapierRay.current = new rapier.Ray(
          { x: t.x, y: t.y, z: t.z },
          { x: 0, y: -1, z: 0 }
        )
      } else {
        rapierRay.current.origin.x = t.x
        rapierRay.current.origin.y = t.y
        rapierRay.current.origin.z = t.z
      }

      const hit = world.castRay(
        rapierRay.current,
        2.0,
        true,
        undefined,
        undefined,
        undefined,
        rb.current
      )
      grounded.current = !!hit && hit.timeOfImpact <= 1.0

      // JUMP — Y axis only, preserves horizontal velocity
      const jumpPressed = !!(get().jump || (gamepad.y && !prevYPressed.current))
      prevYPressed.current = gamepad.y
      jumpCooldown.current = Math.max(0, jumpCooldown.current - 1 / 60)

      if (jumpPressed && grounded.current && jumpCooldown.current === 0) {
        const lv = rb.current.linvel()
        rb.current.setLinvel({ x: lv.x, y: JUMP_FORCE, z: lv.z }, true)
        grounded.current = false
        jumpCooldown.current = 0.15
      }
    }

    // CAMERA — Dark Souls style: orbit around player driven by right stick (inverted)
    const yawSpeed = 2.4 // rad/sec at full stick
    rotationTarget.current += -gamepad.rightStickX * yawSpeed * (1 / 60)

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.15
    )

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current)
    camera.position.lerp(cameraWorldPosition.current, 0.15)

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current)
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.15)

      camera.lookAt(cameraLookAt.current)
    }
  })

  return (
    <RigidBody name="player-rb" colliders={false} lockRotations ref={rb} mass={1} gravityScale={2.5}>
      <group name="player-container" ref={container}>
        <group name="player-camera-target" ref={cameraTarget} position-z={cameraTargetPositionZ} />
        <group
          name="player-camera-position"
          ref={cameraPosition}
          position-y={cameraPositionY}
          position-z={cameraPositionZ}
        />
        <group name="player-inner-group" ref={character}>
          <Pirate
            scale={0.1}
            position-y={-0.25}
            animation={animationIndex}
            position={new Vector3(0, 0, 0)}
          />
        </group>
      </group>
      <BallCollider args={[0.8]} position={[0, 1.5, 0]} />
      <CapsuleCollider args={[0.08, 0.5]} position={[0, 0.1, 0]} />
    </RigidBody>
  )
}
