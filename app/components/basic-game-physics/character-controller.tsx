import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier'
import { useControls } from 'leva'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { degToRad, MathUtils } from 'three/src/math/MathUtils.js'
import type { GamepadState } from './gamepad'
import { characterStateFor, clampCharacterSettings, type CharacterState } from '../game-engine/character-settings'
import type { CharacterSettings } from '../game-engine/types'
import PlayerCharacter from './player-character'
import type { CharacterRuntime } from './use-character-runtime'

const CAMERA_PITCH_SPEED_RATIO = 0.75
const ROLL_DURATION_SECONDS = 0.8
const ROLL_SPEED = 10

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
  spawnPosition,
  characterSettings,
  runtime,
  onAttack,
}: {
  refScene: React.RefObject<THREE.Scene>
  gamepad: GamepadState
  spawnPosition: [number, number, number]
  characterSettings?: CharacterSettings
  runtime: CharacterRuntime
  onAttack?: (position: [number, number, number]) => void
}) => {
  const clampedSettings = useMemo(() => clampCharacterSettings(characterSettings), [characterSettings])
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, JUMP_FORCE } = useControls('Character Control', {
    WALK_SPEED: { value: 2, min: 0.1, max: 4, step: 0.1 },
    RUN_SPEED: { value: 12, min: 12, max: 50, step: 0.1 },
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
      cameraPositionY: { value: 4.5, min: -20, max: 20, step: 0.5 },
      cameraPositionZ: { value: -4.5, min: -20, max: 20, step: 0.5 },
    },
  )
  const rb = useRef<any>(null!)
  const container = useRef<THREE.Group>(null!)
  const character = useRef<THREE.Group>(null!)

  const [characterState, setCharacterState] = useState<CharacterState>('idle')

  const characterRotationTarget = useRef(0)
  const rotationTarget = useRef(0)
  const cameraPitchTarget = useRef(0)
  const cameraTarget = useRef<THREE.Group>(null!)
  const cameraPitch = useRef<THREE.Group>(null!)
  const cameraPosition = useRef<THREE.Group>(null!)
  const cameraWorldPosition = useRef(new Vector3())
  const cameraLookAtWorldPosition = useRef(new Vector3())
  const cameraLookAt = useRef(new Vector3())
  const [, get] = useKeyboardControls()

  // Jump state
  const grounded = useRef(true)
  const jumpCooldown = useRef(0)
  const prevYPressed = useRef(false)
  const prevRollPressed = useRef(false)
  const rollTimer = useRef(0)
  const prevAttackPressed = useRef(false)
  const rapierRay = useRef<any>(null)
  const { world, rapier } = useRapier()

  useFrame(({ camera }, delta) => {

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

      const run = !!(get().run || gamepad.lb) && runtime.canSprint()
      const speed = run ? RUN_SPEED : WALK_SPEED

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * Math.sign(movement.x)
      }

      const moving = movement.x !== 0 || movement.z !== 0
      runtime.tick(delta, run && moving)

      const rollPressed = Boolean(get().roll || gamepad.b)
      if (rollPressed && !prevRollPressed.current && grounded.current && rollTimer.current === 0) {
        rollTimer.current = ROLL_DURATION_SECONDS
        if (moving) characterRotationTarget.current = Math.atan2(movement.x, movement.z)
      }
      prevRollPressed.current = rollPressed
      const rolling = rollTimer.current > 0
      rollTimer.current = Math.max(0, rollTimer.current - delta)

      if (rolling) {
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * ROLL_SPEED
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * ROLL_SPEED
      } else if (moving) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z)
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1,
      )

      rb.current.setLinvel(vel, true)

      // GROUNDED CHECK — native rapier raycast (broadphase-optimized, no mesh traversal)
      const t = rb.current.translation()
      if (!rapierRay.current) {
        rapierRay.current = new rapier.Ray({ x: t.x, y: t.y, z: t.z }, { x: 0, y: -1, z: 0 })
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
        rb.current,
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

      setCharacterState(
        characterStateFor({
          rolling,
          grounded: grounded.current,
          verticalSpeed: rb.current.linvel().y,
          moving,
        }),
      )

      const attackPressed = Boolean(get().attack || gamepad.rb)
      if (attackPressed && !prevAttackPressed.current) {
        const position = rb.current.translation()
        onAttack?.([
          position.x + Math.sin(rotationTarget.current) * 1.45,
          position.y + 0.9,
          position.z + Math.cos(rotationTarget.current) * 1.45,
        ])
      }
      prevAttackPressed.current = attackPressed
    }

    // CAMERA — Dark Souls style: orbit around player driven by right stick (inverted)
    const yawSpeed = clampedSettings.cameraRotationSpeed
    const pitchSpeed = yawSpeed * CAMERA_PITCH_SPEED_RATIO
    const maxPitch = Math.PI / 4
    rotationTarget.current += -gamepad.rightStickX * yawSpeed * delta
    cameraPitchTarget.current = MathUtils.clamp(
      cameraPitchTarget.current + gamepad.rightStickY * pitchSpeed * delta,
      -maxPitch,
      maxPitch,
    )

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.15,
    )
    cameraPitch.current.rotation.x = MathUtils.lerp(
      cameraPitch.current.rotation.x,
      cameraPitchTarget.current,
      0.15,
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
    <RigidBody
      name="player-rb"
      colliders={false}
      lockRotations
      ref={rb}
      position={spawnPosition}
      mass={1}
      gravityScale={2.5}
    >
      <group name="player-container" ref={container}>
        <group name="player-camera-target" ref={cameraTarget} position-z={cameraTargetPositionZ} />
        <group name="player-camera-pitch" ref={cameraPitch}>
          <group
            name="player-camera-position"
            ref={cameraPosition}
            position-y={cameraPositionY}
            position-z={cameraPositionZ}
          />
        </group>
        <group name="player-inner-group" ref={character}>
          <PlayerCharacter settings={clampedSettings} state={characterState} />
        </group>
      </group>
      <BallCollider args={[0.8]} position={[0, 1.5, 0]} />
      <CapsuleCollider args={[0.08, 0.5]} position={[0, 0.1, 0]} />
    </RigidBody>
  )
}
