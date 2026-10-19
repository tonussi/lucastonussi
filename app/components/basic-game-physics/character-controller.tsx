import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, CapsuleCollider, CoefficientCombineRule, RigidBody, useRapier } from '@react-three/rapier'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { degToRad, MathUtils } from 'three/src/math/MathUtils.js'
import type { GamepadState } from './gamepad'
import { jumpVelocity } from '../game-engine/jump'
import { readDodgeInput } from '../game-engine/dodge-input'
import { rollSpeedFor } from '../game-engine/roll'
import { CHARACTER_FOOT_CAPSULE, CHARACTER_FOOT_DEPTH, CHARACTER_FRICTION, CHARACTER_GRAVITY_SCALE, GRAVITY } from './constants'
import { GAMEPAD_BINDINGS } from './gamepad-bindings'
import { GRASS_WIND, resetGrassWind } from './grass-wind'
import { characterStateFor, clampCharacterSettings, type CharacterState } from '../game-engine/character-settings'
import type { CharacterSettings } from '../game-engine/types'
import {
  ACTIONS,
  actionProgress,
  advanceAction,
  GUARD_SPEED_RATIO,
  GUARD_STAMINA_DRAIN_PER_SECOND,
  IDLE_ACTION,
  INTERACT_RANGE,
  startAction,
  type ActionId,
  type ActionState,
} from '../game-engine/character-actions'
import { STAMINA_ID } from '../game-engine/character-stats'
import { createCombatVisual } from './combat-visual'
import EquipmentRig from './equipment-rig'
import PlayerCharacter from './player-character'
import SkillParticles from './skill-particles'
import type { CharacterRuntime } from './use-character-runtime'

const CAMERA_PITCH_SPEED_RATIO = 0.75

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

export interface PickupTarget {
  id: string
  itemId: string
  quantity: number
  position: [number, number, number]
}

const ACTION_BUTTONS: { id: ActionId; key: string; button: keyof typeof GAMEPAD_BINDINGS }[] = [
  { id: 'attack', key: 'attack', button: 'attack' },
  { id: 'strongAttack', key: 'strongAttack', button: 'strongAttack' },
  { id: 'skill', key: 'skill', button: 'skill' },
]

const NO_KEYS: Record<string, boolean> = {}
const THIRD_PERSON_MAX_PITCH = Math.PI / 4
/** 135° each way, 270° of vertical view in total; past vertical the view rolls over the top. */
const FIRST_PERSON_MAX_PITCH = (Math.PI * 3) / 4
const firstPersonEuler = new THREE.Euler(0, 0, 0, 'YXZ')

export const CharacterController = ({
  refScene,
  gamepad,
  spawnPosition,
  characterSettings,
  runtime,
  pickups = [],
  onAttack,
  inputPaused = false,
}: {
  refScene: React.RefObject<THREE.Scene>
  gamepad: GamepadState
  spawnPosition: [number, number, number]
  characterSettings?: CharacterSettings
  runtime: CharacterRuntime
  pickups?: PickupTarget[]
  onAttack?: (position: [number, number, number]) => void
  /** Ignores keyboard input while a dialog owns it; pass an empty gamepad state alongside. */
  inputPaused?: boolean
}) => {
  const clampedSettings = useMemo(() => clampCharacterSettings(characterSettings), [characterSettings])
  const { ROTATION_SPEED } = useControls('Character Control', {
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
  const [, getKeyboard] = useKeyboardControls()
  const get = () => (inputPaused ? NO_KEYS : getKeyboard())

  // Jump state
  const grounded = useRef(true)
  const jumpCooldown = useRef(0)
  const rollTimer = useRef(0)
  const rollHeading = useRef(0)
  const rollSpeedRef = useRef(0)
  const dodgeHeld = useRef(0)
  const action = useRef<ActionState>(IDLE_ACTION)
  const combat = useRef(createCombatVisual())
  const firstPerson = useRef(false)
  const previousInputs = useRef<Record<string, boolean>>({})
  const risingEdge = (name: string, pressed: boolean) => {
    const edge = pressed && !previousInputs.current[name]
    previousInputs.current[name] = pressed
    return edge
  }
  const rapierRay = useRef<any>(null)
  const { world, rapier } = useRapier()

  useEffect(() => resetGrassWind, [])

  useFrame(({ camera, clock }, delta) => {

    if (rb.current) {
      const vel = rb.current.linvel()
      const bodyPosition = rb.current.translation()
      GRASS_WIND.player.value.set(bodyPosition.x, bodyPosition.y, bodyPosition.z)
      GRASS_WIND.time.value = clock.elapsedTime

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

      const keys = get() as Record<string, boolean>
      const dodgeDown = Boolean(gamepad[GAMEPAD_BINDINGS.dodge])
      const dodge = readDodgeInput(Boolean(previousInputs.current.dodge), dodgeDown, dodgeHeld.current, delta, clampedSettings.dashHoldSeconds)
      dodgeHeld.current = dodge.held
      previousInputs.current.dodge = dodgeDown

      const actionIdle = action.current.id === null
      const guarding = Boolean(keys.guard || gamepad[GAMEPAD_BINDINGS.guard]) && actionIdle && rollTimer.current === 0 && runtime.canSprint()
      if (guarding) runtime.trySpend(STAMINA_ID, GUARD_STAMINA_DRAIN_PER_SECOND * delta)

      const run = Boolean(keys.run || dodge.dashing) && !guarding && runtime.canSprint()
      const speed = (run ? clampedSettings.runSpeed : clampedSettings.walkSpeed) * (guarding ? GUARD_SPEED_RATIO : 1)

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * Math.sign(movement.x)
      }

      const moving = movement.x !== 0 || movement.z !== 0
      runtime.tick(delta, run && moving)

      const dodgeRequested = dodge.tapped || risingEdge('rollKey', Boolean(keys.roll))
      if (dodgeRequested && moving && grounded.current && rollTimer.current === 0 && actionIdle) {
        rollTimer.current = clampedSettings.rollDuration
        characterRotationTarget.current = Math.atan2(movement.x, movement.z)
        rollHeading.current = characterRotationTarget.current
        rollSpeedRef.current = rollSpeedFor(clampedSettings.rollDistance, clampedSettings.rollDuration)
      }
      const rolling = rollTimer.current > 0
      rollTimer.current = Math.max(0, rollTimer.current - delta)

      if (rolling) {
        vel.x = Math.sin(rotationTarget.current + rollHeading.current) * rollSpeedRef.current
        vel.z = Math.cos(rotationTarget.current + rollHeading.current) * rollSpeedRef.current
      } else if (moving) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z)
        const magnitude = Math.min(1, Math.hypot(movement.x, movement.z))
        vel.x = MathUtils.damp(vel.x, Math.sin(rotationTarget.current + characterRotationTarget.current) * speed * magnitude, clampedSettings.movementResponse, delta)
        vel.z = MathUtils.damp(vel.z, Math.cos(rotationTarget.current + characterRotationTarget.current) * speed * magnitude, clampedSettings.movementResponse, delta)
      } else {
        vel.x = 0
        vel.z = 0
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        1 - Math.exp(-clampedSettings.turnResponse * delta),
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
      const jumpPressed = Boolean(keys.jump) || risingEdge('jump', Boolean(gamepad[GAMEPAD_BINDINGS.jump]))
      jumpCooldown.current = Math.max(0, jumpCooldown.current - delta)

      if (jumpPressed && grounded.current && jumpCooldown.current === 0) {
        const lv = rb.current.linvel()
        rb.current.setLinvel({ x: lv.x, y: jumpVelocity(clampedSettings.jumpHeight, GRAVITY, CHARACTER_GRAVITY_SCALE), z: lv.z }, true)
        grounded.current = false
        jumpCooldown.current = 0.15
      }

      const tryStartAction = (id: ActionId) => {
        const definition = ACTIONS.find((entry) => entry.id === id)!
        const tuning = clampedSettings.actions[id]
        if (action.current.id !== null || rolling || !grounded.current) return false
        if (definition.resourceId && !runtime.trySpend(definition.resourceId, tuning.cost)) return false
        action.current = startAction(action.current, id, tuning.duration)
        return true
      }

      ACTION_BUTTONS.forEach(({ id, key, button }) => {
        const pressed = risingEdge(id, Boolean(keys[key] || gamepad[GAMEPAD_BINDINGS[button]]))
        if (!pressed || !tryStartAction(id)) return
        if (id === 'skill') combat.current.skillSerial += 1
        else {
          const position = rb.current.translation()
          onAttack?.([
            position.x + Math.sin(rotationTarget.current) * 1.45,
            position.y + 0.9,
            position.z + Math.cos(rotationTarget.current) * 1.45,
          ])
        }
      })

      if (risingEdge('toggleView', Boolean(keys.toggleView || gamepad[GAMEPAD_BINDINGS.toggleView]))) {
        firstPerson.current = !firstPerson.current
        character.current.visible = !firstPerson.current
      }

      const useItemPressed = risingEdge('useItem', Boolean(keys.useItem || gamepad[GAMEPAD_BINDINGS.useItem]))
      const interactPressed = risingEdge('interact', Boolean(keys.interact || gamepad[GAMEPAD_BINDINGS.interact]))

      if ((useItemPressed || interactPressed) && actionIdle) {
        const position = rb.current.translation()
        const target = pickups
          .filter(({ id }) => !runtime.state.collected.includes(id))
          .map((pickup) => ({ pickup, distance: Math.hypot(pickup.position[0] - position.x, pickup.position[1] - position.y, pickup.position[2] - position.z) }))
          .filter(({ distance }) => distance <= INTERACT_RANGE)
          .sort((first, second) => first.distance - second.distance)[0]
        if (target) {
          if (tryStartAction('interact')) runtime.pickUp(target.pickup.id, target.pickup.itemId, target.pickup.quantity)
        } else if (useItemPressed && runtime.consumeItem()) {
          tryStartAction('useItem')
        }
      }

      action.current = advanceAction(action.current, delta)
      combat.current.action = action.current.id
      combat.current.progress = actionProgress(action.current)
      combat.current.guarding = guarding
      setCharacterState(action.current.id === 'interact' ? 'interacting' : characterStateFor({
        rolling, grounded: grounded.current, verticalSpeed: rb.current.linvel().y, moving,
      }))
    }

    // CAMERA — Dark Souls style: orbit around player driven by right stick (inverted)
    const yawSpeed = clampedSettings.cameraRotationSpeed
    const pitchSpeed = yawSpeed * CAMERA_PITCH_SPEED_RATIO
    const maxPitch = firstPerson.current ? FIRST_PERSON_MAX_PITCH : THIRD_PERSON_MAX_PITCH
    rotationTarget.current += -gamepad.rightStickX * yawSpeed * delta
    cameraPitchTarget.current = MathUtils.clamp(
      cameraPitchTarget.current + gamepad.rightStickY * pitchSpeed * delta,
      -maxPitch,
      maxPitch,
    )

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      1 - Math.exp(-clampedSettings.cameraResponse * delta),
    )
    cameraPitch.current.rotation.x = MathUtils.lerp(
      cameraPitch.current.rotation.x,
      cameraPitchTarget.current,
      1 - Math.exp(-clampedSettings.cameraResponse * delta),
    )

    if (firstPerson.current && rb.current) {
      const body = rb.current.translation()
      const yaw = container.current.rotation.y
      const pitch = cameraPitch.current.rotation.x
      camera.position.set(body.x, body.y - CHARACTER_FOOT_DEPTH + clampedSettings.firstPersonEyeHeight, body.z)
      // Euler instead of lookAt: lookAt flips the view once pitch passes straight up or down.
      camera.quaternion.setFromEuler(firstPersonEuler.set(-pitch, yaw + Math.PI, 0))
      return
    }

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current)
    camera.position.lerp(cameraWorldPosition.current, 1 - Math.exp(-clampedSettings.cameraResponse * delta))

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current)
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 1 - Math.exp(-clampedSettings.cameraResponse * delta))

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
      gravityScale={CHARACTER_GRAVITY_SCALE}
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
          <EquipmentRig combat={combat.current} equipment={clampedSettings.equipment} />
          <SkillParticles combat={combat.current} />
        </group>
      </group>
      <BallCollider args={[0.8]} position={[0, 1.5, 0]} friction={CHARACTER_FRICTION} frictionCombineRule={CoefficientCombineRule.Min} />
      <CapsuleCollider args={[CHARACTER_FOOT_CAPSULE.halfHeight, CHARACTER_FOOT_CAPSULE.radius]} position={[0, CHARACTER_FOOT_CAPSULE.offsetY, 0]} friction={CHARACTER_FRICTION} frictionCombineRule={CoefficientCombineRule.Min} />
    </RigidBody>
  )
}
