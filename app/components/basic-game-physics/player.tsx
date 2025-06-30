import useInputHandler from './input-handler'
import usePlayerModel from './model-loader'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'
import CubeTravel from './cube-travel'
extend(THREE as any)

const ZeroVector = new THREE.Vector3(0, 0, 0)

const Player = ({
  refCamera,
  refScene,
}: {
  refCamera: RefObject<THREE.PerspectiveCamera>
  refScene: RefObject<THREE.Scene>
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const clock = new THREE.Clock(true)

  const { keysPressed, mouse } = useInputHandler()

  const { player, animations, type } = usePlayerModel()

  const [bullets, setProjectiles] = useState<THREE.Vector3[]>([])
  const [showArrow, setShowArrow] = useState(false)
  const [arrowDirection, setArrowDirection] = useState(new THREE.Vector3(0, 0, -1))
  const [moveSpeed, setMoveSpeed] = useState(0.09)
  const [isJumping, setIsJumping] = useState(false)
  let mixer: THREE.AnimationMixer | null = new THREE.AnimationMixer(player)

  // Only proceed if obj is loaded
  if (!player) {
    return null
  }

  player.scale.set(0.002, 0.002, 0.002)

  // Make all materials wireframe
  if (player) {
    player.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.wireframe = true
            mat.transparent = true
            mat.opacity = 0.1
          })
          debugger
        } else {
          child.material.wireframe = true
          child.material.transparent = true
          child.material.opacity = 0.1
        }
      }
    })
  }

  const skeleton = new THREE.SkeletonHelper(player)
  skeleton.visible = true
  refScene.current?.add(skeleton)

  const axesHelper = new THREE.AxesHelper(10)
  mesh.current?.add(axesHelper)

  if (animations && animations.length > 0) {
    if (type === 'gltf') {
      if (mixer) mixer.clipAction(animations[1]).play()
    }
  }

  useFrame(() => {
    const delta = clock.getDelta()

    const camera = refCamera.current
    if (!camera) return

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    const movement = new THREE.Vector3()

    // Check if any movement key is pressed
    const isMoving = keysPressed.w || keysPressed.a || keysPressed.s || keysPressed.d
    if (mixer && isMoving && type === 'gltf') mixer.update(delta)

    setShowArrow(isMoving)

    handleLeftMouseClick()

    handleProjectilesAnimations()

    handleMoveForward()

    handleMoveBackwards()

    handleMoveLeftwards()

    handleMoveRightwards()

    applyActionsMovimentsEtc()

    function applyActionsMovimentsEtc() {
      // Apply movement to mesh
      if (mesh.current) {
        mesh.current.position.add(movement)

        camera.position.copy(mesh.current.position)
        camera.rotation.set(-0.5, 0, 0)
        camera.position.set(
          mesh.current.position.x,
          mesh.current.position.y + 20,
          mesh.current.position.z + 20
        )

        // Update spotlight to follow the player
        const spotlight = refScene.current.getObjectByName('spotlight')
        if (spotlight && spotlight instanceof THREE.SpotLight) {
          spotlight.position.copy(mesh.current.position)
          spotlight.position.y += 5 // Keep spotlight above the player
          spotlight.target.position.copy(mesh.current.position)
          spotlight.target.updateMatrixWorld()
        }

        // camera.updateMatrixWorld()
        // camera.updateMatrix()
        // mesh.current.updateMatrix()
      }
    }

    function handleMoveRightwards() {
      if (keysPressed.d) {
        // Strafe right (perpendicular to camera direction)
        const cameraDirectionClone = cameraDirection.clone()
        const right = new THREE.Vector3()
        right.crossVectors(cameraDirectionClone, camera.up).normalize()
        // Rotate object to face the direction of movement (right)
        const targetRotation = Math.atan2(-right.x, -right.z)
        player.rotation.y = targetRotation
        movement.add(right.clone().multiplyScalar(-moveSpeed))
        setArrowDirection(right.clone().multiplyScalar(-1))
      }
    }

    function handleMoveLeftwards() {
      if (keysPressed.a) {
        // Strafe left (perpendicular to camera direction)
        const cameraDirectionClone = cameraDirection.clone()
        const right = new THREE.Vector3()
        right.crossVectors(cameraDirectionClone, camera.up).normalize()
        // Rotate object to face the direction of movement (left)
        const targetRotation = Math.atan2(right.x, right.z)
        player.rotation.y = targetRotation
        movement.add(right.clone().multiplyScalar(moveSpeed))
        setArrowDirection(right)
      }
    }

    function handleMoveBackwards() {
      if (keysPressed.s) {
        // The projection make the vector translate to the obj backwards direction
        const cameraDirectionClone = cameraDirection.clone()
        const projectedDirection = new THREE.Vector3(
          cameraDirectionClone.x,
          0,
          cameraDirectionClone.z
        ).normalize()
        const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
        player.rotation.y = targetRotation
        movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
        setArrowDirection(projectedDirection)
      }
    }

    function handleMoveForward() {
      if (keysPressed.w) {
        // The projection make the vector translate to the obj forward direction
        const cameraDirectionClone = cameraDirection.clone()
        const projectedDirection = new THREE.Vector3(
          -cameraDirectionClone.x,
          0,
          -cameraDirectionClone.z
        ).normalize()
        const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
        player.rotation.y = targetRotation
        movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
        setArrowDirection(projectedDirection)
      }
    }

    function handleProjectilesAnimations() {
      bullets.forEach((bullet) => {
        // Add physics to bullets - make them fall and roll on ground
        // Keep bullets on ground level (y = 0)
        bullet.y = 3

        // Add random movement on the ground
        const randomX = (Math.random() - 0.5) * 0.1 // Reduced random X movement
        const randomZ = (Math.random() - 0.5) * 0.1 // Reduced random Z movement
        bullet.x += randomX
        bullet.z += randomZ
      })
    }

    function handleLeftMouseClick() {
      if (mouse.isLeft) {
        if (bullets.length > 3) return

        // Get the character's current position and forward direction
        const characterPosition = player.position.clone()
        const forwardDirection = new THREE.Vector3()
        player.getWorldDirection(forwardDirection)
        forwardDirection.y = 0 // Keep it horizontal
        forwardDirection.normalize()

        // Create bullets positioned in front of the character
        const projectiles = new THREE.Vector3()

        // Position bullets 8 units in front of the character
        const bulletPosition = characterPosition
          .clone()
          .add(forwardDirection.clone().multiplyScalar(10))
        projectiles.copy(bulletPosition)

        // Make the box face the direction it's being thrown
        const targetRotation = Math.atan2(forwardDirection.x, forwardDirection.z)
        projectiles.y = targetRotation

        // Add bullet to the scene and array
        bullets.push(projectiles)

        // Update bullets state
        // Clear bullets after 5 seconds
        setProjectiles((prevBullets) => [...prevBullets, ...bullets])
        setTimeout(() => {
          setProjectiles([])
        }, 10000)
      }
    }
  })

  return (
    <instancedMesh ref={refScene} castShadow args={[undefined, undefined, 1]}>
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
      <primitive
        castShadow
        receiveShadow
        name="player"
        rigidBody
        colliders={['box']}
        mass={1}
        gravity={[0, -9.86, 0]}
        // linearDamping={0.9}
        // angularDamping={0.7}
        // linearFactor={[1, 1, 1]}
        // angularFactor={[1, 1, 1]}
        // restitution={0.2}
        // friction={0.5}
        // angularVelocity={[0, 0, 0]}
        // linearVelocity={[0, 0, 0]}
        // linearVelocityFromRotation={[0, 0, 0]}
        // angularVelocityFromRotation={[0, 0, 0]}
        // linearVelocityFromRotationFactor={[1, 1, 1]}
        // angularVelocityFromRotationFactor={[1, 1, 1]}
        // linearVelocityFromRotationDamping={[0.9, 0.9, 0.9]}
        // angularVelocityFromRotationDamping={[0.9, 0.9, 0.9]}
        // linearVelocityFromRotationDampingFactor={[1, 1, 1]}
        // angularVelocityFromRotationDampingFactor={[1, 1, 1]}
        object={player}
        ref={mesh}
        position={[0, 0, 0]}
      />
    </instancedMesh>
  )
}

export default Player
