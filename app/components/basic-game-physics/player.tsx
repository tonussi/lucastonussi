import useInputHandler from './input-handler'
import usePlayerModel from './model-loader'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'
import CubeTravel from './cube-travel'
extend(THREE as any)

const ZeroVector = new THREE.Vector3(0, 0, 0)

const Player = forwardRef(({ refScene }: { refScene: RefObject<THREE.Scene> }, ref) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const clock = new THREE.Clock(true)

  const { keysPressed, mouse } = useInputHandler()

  const { player, animations, type } = usePlayerModel()

  const [bullets, setProjectiles] = useState<THREE.Vector3[]>([])
  const [showArrow, setShowArrow] = useState(false)
  const [arrowDirection, setArrowDirection] = useState(new THREE.Vector3(0, 0, -1))
  const [moveSpeed, setMoveSpeed] = useState(0.5)
  const [turningVelocity, setTurningVelocity] = useState(0.6)
  const [isPlayingRunningAnimation, setIsPlayingRunningAnimation] = useState(false)
  let mixer: THREE.AnimationMixer | null = new THREE.AnimationMixer(player)

  const camera = refScene.current?.getObjectByName('camera') as THREE.PerspectiveCamera

  // Only proceed if obj is loaded
  if (!player) {
    return null
  }

  // Expose mesh ref
  useImperativeHandle(ref, () => mesh.current)

  // Add target position state
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(0, 0, 0))
  // Add target rotation state
  const [targetRotation, setTargetRotation] = useState(player.rotation.x)

  // Ensure all meshes in the player model cast shadows
  player.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = true
  })

  const [animationIndex, setAnimationIndex] = useState(0)

  // Increment animationIndex every second
  // Use a ref to avoid stale closure
  const animationIndexRef = useRef(animationIndex)
  animationIndexRef.current = animationIndex

  if (mixer) mixer.clipAction(animations[1]).play()

  // Set up interval to increment animationIndex every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationIndex((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useFrame(() => {
    const delta = clock.getDelta()

    if (!camera) return

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    const movement = new THREE.Vector3()

    // Check if any movement key is pressed
    const isMoving = keysPressed.w || keysPressed.a || keysPressed.s || keysPressed.d
    if (mixer && isMoving) mixer.update(animationIndex + delta)

    setShowArrow(isMoving)

    handleLeftMouseClick()

    handleProjectilesAnimations()

    // playRunningAnimation(isMoving)

    handleMoveForward()

    handleMoveBackwards()

    handleMoveLeftwards()

    handleMoveRightwards()

    applyActionsMovimentsEtc()

    function applyActionsMovimentsEtc() {
      // Instead of mesh.current.position.add(movement), set target position
      if (mesh.current) {
        setTargetPosition(mesh.current.position.clone().add(movement))
        // Smoothly interpolate position
        mesh.current.position.lerp(targetPosition, turningVelocity)
        // Smoothly interpolate rotation
        player.rotation.y += (targetRotation - player.rotation.y) * turningVelocity
        camera.lookAt(mesh.current.position)

        // Update spotlight to follow the player
        const spotlight = refScene.current.getObjectByName('spotlight')
        if (spotlight && spotlight instanceof THREE.SpotLight) {
          spotlight.position.copy(mesh.current.position)
          spotlight.position.y += 5 // Keep spotlight above the player
          spotlight.target.position.copy(mesh.current.position)
          spotlight.target.updateMatrixWorld()
        }

        camera.updateMatrixWorld()
        camera.updateMatrix()
        mesh.current.updateMatrix()
        mesh.current.updateMatrixWorld()
        refScene.current.updateMatrixWorld()
        refScene.current.updateMatrix()
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
        movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
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
        movement.add(left.clone().multiplyScalar(-moveSpeed))
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
        movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
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
        movement.add(right.clone().multiplyScalar(moveSpeed))
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
        if (bullets.length > 0) return

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
        // Clear bullets after 5 seconds
        setProjectiles(bullets)
        setTimeout(() => {
          setProjectiles([])
        }, 1000)
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
            10, // length
            0x00ff00, // color
            0.5, // head length
            0.1, // head width
          ]}
          position={player.position}
        />
      )}
      {bullets.map((bullet, index) => (
        <CubeTravel key={index} position={bullet} />
      ))}
      <primitive name="player" object={player} ref={mesh} position={[0, 0, 0]} castShadow />
    </>
  )
})

export default Player
