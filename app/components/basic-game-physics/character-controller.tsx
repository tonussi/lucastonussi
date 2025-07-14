// copied from https://youtu.be/yjpGVIe_Gy8

import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, CapsuleCollider, RigidBody } from '@react-three/rapier'
import { useControls } from 'leva'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { degToRad, MathUtils } from 'three/src/math/MathUtils.js'
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

export const CharacterController = ({ refScene }: { refScene: React.RefObject<THREE.Scene> }) => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls('Character Control', {
    WALK_SPEED: { value: 2, min: 0.1, max: 4, step: 0.1 },
    RUN_SPEED: { value: 5, min: 0.2, max: 12, step: 0.1 },
    ROTATION_SPEED: {
      value: degToRad(0),
      min: degToRad(0.1),
      max: degToRad(5),
      step: degToRad(0.1),
    },
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

  useFrame(({ camera }) => {
    if (rb.current) {
      const vel = rb.current.linvel()

      const movement = {
        x: 0,
        z: 0,
      }

      if (get().forward) {
        movement.z = 1
      }
      if (get().backward) {
        movement.z = -1
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED

      if (get().left) {
        movement.x = 1
      }
      if (get().right) {
        movement.x = -1
      }

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * movement.x
      }

      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z)
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed
        if (speed === RUN_SPEED) {
          setAnimationIndex(1)
        } else {
          setAnimationIndex(1)
        }
      } else {
        setAnimationIndex(0)
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      )

      rb.current.setLinvel(vel, true)
    }

    // CAMERA
    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    )

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current)
    camera.position.lerp(cameraWorldPosition.current, 0.1)

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current)
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1)

      camera.lookAt(cameraLookAt.current)
    }
  })

  return (
    <RigidBody name="player-rb" colliders={false} lockRotations ref={rb} mass={1}>
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
