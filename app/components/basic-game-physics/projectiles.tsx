import useInputHandler from './input-handler'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { useRef, useState, type RefObject } from 'react'

import { useKeyboardControls } from '@react-three/drei'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import CubeTravel from './cube-travel'
import Pirate from './pirate'
extend(THREE as any)

const PlayerMoviment = ({ refScene }: { refScene: RefObject<THREE.Scene> }) => {
  const clock = new THREE.Clock(true)

  const { mouse } = useInputHandler()

  const [bullets, setProjectiles] = useState<THREE.Vector3[]>([])
  const [animationIndex, setAnimationIndex] = useState(0)

  const camera = refScene.current?.getObjectByName('camera') as THREE.PerspectiveCamera
  const player = refScene.current?.getObjectByName('player') as THREE.Group

  const [rotateAngle, setRotateAngle] = useState(new THREE.Vector3(0, 1, 0))
  const [walkDirection, setWalkDirection] = useState(new THREE.Vector3())
  const moveSpeed = 5

  const rb = useRef<any>(null!)
  const container = useRef<THREE.Group>(null!)
  const character = useRef<THREE.Group>(null!)

  const [animation, setAnimation] = useState('idle')

  const characterRotationTarget = useRef(0)
  const rotationTarget = useRef(0)
  const cameraTarget = useRef<THREE.Vector3>(null!)
  const cameraPosition = useRef<THREE.Vector3>(null!)

  const [, get] = useKeyboardControls()

  useFrame(() => {
    const delta = clock.getDelta()

    setWalkDirection(new THREE.Vector3(0, 0, 0))

    const isMoving = get().forward || get().backward || get().left || get().right

    handleLeftMouseClick()

    handleProjectilesAnimations()

    applyAnimations(isMoving)

    update(delta)
  })

  function applyAnimations(isMoving: boolean) {
    setAnimationIndex(isMoving ? 1 : 0)
  }

  function update(delta: number) {
    // calculate towards camera direction
    let angleYCameraDirection = Math.atan2(
      camera.position.x - player.position.x,
      camera.position.z - player.position.z
    )

    // rotate model
    player.quaternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffset())
    player.quaternion.rotateTowards(player.quaternion, 0.2)

    // calculate direction
    camera.getWorldDirection(walkDirection)
    walkDirection.y = 0
    walkDirection.normalize()
    walkDirection.applyAxisAngle(rotateAngle, directionOffset())

    // move model & camera
    const moveX = walkDirection.x * moveSpeed * delta
    const moveZ = walkDirection.z * moveSpeed * delta
    player.position.x += moveX
    player.position.z += moveZ
  }

  function updateCameraTarget(moveX: number, moveZ: number) {
    // move camera
    camera.position.x += moveX
    camera.position.z += moveZ

    // update camera target
    cameraTarget.current.x = player.position.x
    cameraTarget.current.y = player.position.y + 1
    cameraTarget.current.z = player.position.z
  }

  function directionOffset() {
    var directionOffset = 0 // w

    if (get().forward) {
      if (get().left) {
        directionOffset = Math.PI / 4 // w+a
      } else if (get().right) {
        directionOffset = -Math.PI / 4 // w+d
      }
    } else if (get().backward) {
      if (get().left) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
      } else if (get().right) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
      } else {
        directionOffset = Math.PI // s
      }
    } else if (get().left) {
      directionOffset = Math.PI / 2 // a
    } else if (get().right) {
      directionOffset = -Math.PI / 2 // d
    }

    return directionOffset
  }

  function handleProjectilesAnimations() {
    bullets.forEach((bullet) => {
      // Add physics to bullets - make them fall and roll on ground
      // Keep bullets on ground level (y = 0)
      bullet.y = 0

      // Add random movement on the ground
      const randomX = (Math.random() - 0.5) * 0.1 // Reduced random X movement
      const randomZ = (Math.random() - 0.5) * 0.1 // Reduced random Z movement
      bullet.x += randomX
      bullet.z += randomZ
    })
  }

  function handleLeftMouseClick() {
    if (mouse.isLeft) {
      // Get the character's current position and forward direction
      const characterPosition = player.position.clone()
      const forwardDirection = new THREE.Vector3()
      player.getWorldDirection(forwardDirection)
      forwardDirection.y = 0 // Keep it horizontal
      forwardDirection.normalize()

      // Create bullets positioned in front of the character
      const projectiles = new THREE.Vector3()

      // Position bullets 8 units in front of the character
      const bulletPosition = characterPosition.clone().add(forwardDirection.clone())
      projectiles.copy(bulletPosition)

      // Make the box face the direction it's being thrown
      const targetRotation = Math.atan2(forwardDirection.x, forwardDirection.z)
      projectiles.y = targetRotation

      // Add bullet to the scene and array
      bullets.push(projectiles)

      // Update bullets state
      if (bullets.length > 10) {
        setProjectiles([])
      }

      setProjectiles([...bullets])
    }
  }

  return (
    <>
      {bullets.map((bullet, index) => (
        <CubeTravel key={index} player={player} position={bullet} />
      ))}
      <RigidBody colliders={false} lockRotations ref={rb}>
        <group ref={container}>
          <group ref={cameraTarget} position-z={1.5} />
          <group ref={cameraPosition} position-y={4} position-z={-4} />
          <group ref={character}>
            <Pirate animationIndex={animationIndex} />
          </group>
        </group>
        <CapsuleCollider args={[0.08, 0.15]} />
      </RigidBody>
    </>
  )
}

export default PlayerMoviment
