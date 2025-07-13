import useInputHandler from './input-handler'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { useState, type RefObject } from 'react'

import * as THREE from 'three'
import CubeTravel from './cube-travel'
import Mover from './mover'
import Pirate from './pirate'
extend(THREE as any)

const ZeroVector = new THREE.Vector3(0, 0, 0)

const PlayerMoviment = ({ refScene }: { refScene: RefObject<THREE.Scene> }) => {
  const clock = new THREE.Clock(true)

  const { keysPressed, mouse } = useInputHandler()

  const [bullets, setProjectiles] = useState<THREE.Vector3[]>([])
  const [showArrow, setShowArrow] = useState(false)
  const [arrowDirection, setArrowDirection] = useState(new THREE.Vector3(0, 0, -1))
  const [moveSpeed, setMoveSpeed] = useState(0.5)
  const [turningVelocity, setTurningVelocity] = useState(0.6)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [movement, setMovement] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))

  const camera = refScene.current?.getObjectByName('camera') as THREE.PerspectiveCamera
  const player = refScene.current?.getObjectByName('player') as THREE.Group
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3())
  const [targetRotation, setTargetRotation] = useState(0)

  useFrame(() => {
    const delta = clock.getDelta()

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    const movementCalculation = new THREE.Vector3()

    // Check if any movement key is pressed
    const isMoving = keysPressed.w || keysPressed.a || keysPressed.s || keysPressed.d

    setShowArrow(isMoving)

    handleLeftMouseClick()

    handleProjectilesAnimations()

    handleMoveForward()

    handleMoveBackwards()

    handleMoveLeftwards()

    handleMoveRightwards()

    applyActionsMovimentsEtc(isMoving)

    function applyActionsMovimentsEtc(isMoving: boolean) {
      // Instead of mesh.current.position.add(movement), set target position
      if (isMoving) {
        setAnimationIndex(1)
        setMovement(movementCalculation)
        setTargetPosition(player.position.clone().add(movementCalculation))
        // Smoothly interpolate position
        player.position.lerp(targetPosition, turningVelocity)
        // Smoothly interpolate rotation
        player.rotation.y += (targetRotation - player.rotation.y) * turningVelocity
      } else {
        setAnimationIndex(0)
        setMovement(new THREE.Vector3(0, 0, 0))
        player.position.lerp(targetPosition, turningVelocity)
        player.rotation.y += (targetRotation - player.rotation.y) * turningVelocity
      }
    }

    function handleMoveForward() {
      if (keysPressed.w) {
        // The projection make the vector translate to the obj forward direction
        const cameraDirectionClone = cameraDirection.clone()
        const projectedDirection = new THREE.Vector3(
          cameraDirectionClone.x,
          0,
          cameraDirectionClone.z
        ).normalize()
        const newTargetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
        setTargetRotation(newTargetRotation)
        movementCalculation.add(projectedDirection.clone().multiplyScalar(moveSpeed))
        setArrowDirection(projectedDirection)
      }
    }

    function handleMoveLeftwards() {
      if (keysPressed.a) {
        // Strafe left (perpendicular to camera direction)
        const cameraDirectionClone = cameraDirection.clone()
        const left = new THREE.Vector3()
        left.crossVectors(cameraDirectionClone, camera.up).normalize()
        // Rotate object to face the direction of movement (left)
        const newTargetRotation = Math.atan2(-left.x, -left.z)
        setTargetRotation(newTargetRotation)
        movementCalculation.add(left.clone().multiplyScalar(-moveSpeed))
        setArrowDirection(left.clone().multiplyScalar(-1))
      }
    }

    function handleMoveBackwards() {
      if (keysPressed.s) {
        // The projection make the vector translate to the obj backwards direction
        const cameraDirectionClone = cameraDirection.clone()
        const projectedDirection = new THREE.Vector3(
          -cameraDirectionClone.x,
          0,
          -cameraDirectionClone.z
        ).normalize()
        const newTargetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
        setTargetRotation(newTargetRotation)
        movementCalculation.add(projectedDirection.clone().multiplyScalar(moveSpeed))
        setArrowDirection(projectedDirection)
      }
    }

    function handleMoveRightwards() {
      if (keysPressed.d) {
        // Strafe right (perpendicular to camera direction)
        const cameraDirectionClone = cameraDirection.clone()
        const right = new THREE.Vector3()
        right.crossVectors(cameraDirectionClone, camera.up).normalize()
        // Rotate object to face the direction of movement (right)
        const newTargetRotation = Math.atan2(right.x, right.z)
        setTargetRotation(newTargetRotation)
        movementCalculation.add(right.clone().multiplyScalar(moveSpeed))
        setArrowDirection(right.clone().multiplyScalar(1))
      }
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
  })

  return (
    <>
      {/* Direction arrow helper */}
      {showArrow && Math.random() > 0.9 && (
        <arrowHelper
          args={[
            arrowDirection, // direction
            ZeroVector, // origin
            1, // length
            Math.random() * 0xffffff, // color
            0.09, // head length
            0.09, // head width
          ]}
          position={player.position}
        />
      )}
      {bullets.map((bullet, index) => (
        <CubeTravel key={index} player={player} position={bullet} />
      ))}
      <Mover moviment={movement}>
        <Pirate animationIndex={animationIndex} />
      </Mover>
    </>
  )
}

export default PlayerMoviment
