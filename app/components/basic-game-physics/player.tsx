import { useFBX } from '@react-three/drei'
import useInputHandler from './input-handler'
import usePlayerModel from './model-loader'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

const Player = ({
  refCamera,
  refScene,
}: {
  refCamera: RefObject<THREE.PerspectiveCamera>
  refScene: RefObject<THREE.Scene>
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const clock = new THREE.Clock()

  const { keysPressed, mouse } = useInputHandler()

  const { player } = usePlayerModel()

  const [bullets, setProjectiles] = useState<THREE.Mesh[]>([])

  const actions = useFBX('/models/low-poly/animations/idle.fbx')
  const mixer = useRef(new THREE.AnimationMixer(player))

  useFrame((state, delta) => {
    mixer.current.update(delta)
  })

  useEffect(() => {
    if (actions.animations && actions.animations.length) {
      actions.animations.forEach((clip) => {
        mixer.current.clipAction(clip, player).play()
      })
    }
  }, [actions])

  // Only proceed if obj is loaded
  if (!player) {
    return null
  }

  player.scale.set(0.001, 0.001, 0.001)

  // Make all materials wireframe
  if (player) {
    player.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.wireframe = true
            mat.transparent = true
            mat.opacity = 0.1
          })
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

  useFrame(() => {
    const delta = clock.getDelta()
    mixer.current.update(delta)

    // Get camera's forward vector
    const camera = refCamera.current
    if (!camera) return

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    // Calculate movement based on camera direction
    const moveSpeed = 0.09
    const movement = new THREE.Vector3()

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
        camera.rotation.set(-0.3, 0, 0)
        camera.position.set(
          mesh.current.position.x,
          mesh.current.position.y + 5,
          mesh.current.position.z + 9
        )
        camera.updateMatrixWorld()

        // Update spotlight to follow the player
        const spotlight = refScene.current.getObjectByName('spotlight')
        if (spotlight && spotlight instanceof THREE.SpotLight) {
          spotlight.position.copy(mesh.current.position)
          spotlight.position.y += 5 // Keep spotlight above the player
          spotlight.target.position.copy(mesh.current.position)
          spotlight.target.updateMatrixWorld()
        }
        mesh.current.updateMatrix()
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
      }
    }

    function handleProjectilesAnimations() {
      bullets.forEach((bullet) => {
        // Add physics to bullets - make them fall and roll on ground
        bullet.position.y -= 0.5 // Gravity effect

        // Keep bullets on ground level (y = 0)
        if (bullet.position.y <= 0) {
          bullet.position.y = 0

          // Add random rolling motion when on ground
          bullet.rotation.x += (Math.random() - 0.5) * 0.2 // Random forward/backward roll
          bullet.rotation.z += (Math.random() - 0.5) * 0.15 // Random side roll
          bullet.rotation.y += (Math.random() - 0.5) * 0.1 // Random yaw rotation

          // Add random movement on the ground
          const randomX = (Math.random() - 0.5) * 0.1 // Reduced random X movement
          const randomZ = (Math.random() - 0.5) * 0.1 // Reduced random Z movement
          bullet.position.x += randomX
          bullet.position.z += randomZ
        }
      })
    }

    function handleLeftMouseClick() {
      if (mouse.isLeft) {
        // Create bullets in front of the character
        const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
        const boxMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() * 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.8,
        })

        // Get the character's current position and forward direction
        const characterPosition = player.position.clone()
        const forwardDirection = new THREE.Vector3()
        player.getWorldDirection(forwardDirection)
        forwardDirection.y = 0 // Keep it horizontal
        forwardDirection.normalize()

        // Create bullets positioned in front of the character
        const projectiles = new THREE.Mesh(boxGeometry, boxMaterial)

        // Position bullets 8 units in front of the character
        const bulletPosition = characterPosition
          .clone()
          .add(forwardDirection.clone().multiplyScalar(8))
        projectiles.position.copy(bulletPosition)

        // Make the box face the direction it's being thrown
        const targetRotation = Math.atan2(forwardDirection.x, forwardDirection.z)
        projectiles.rotation.y = targetRotation

        // Add bullet to the scene and array
        refScene.current?.add(projectiles)
        bullets.push(projectiles)

        // Update bullets state
        // Clear bullets after 5 seconds
        setProjectiles((prevBullets) => [...prevBullets, ...bullets])
        setTimeout(() => {
          bullets.forEach((bullet) => {
            refScene.current?.remove(bullet)
            bullet.geometry.dispose()
            if (bullet.material instanceof THREE.Material) {
              bullet.material.dispose()
            }
          })
          setProjectiles((prevBullets) => prevBullets.filter((bullet) => !bullets.includes(bullet)))
        }, 1000)
      }
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1]}>
      <primitive object={player} position={[0, 0, 0]} />
    </instancedMesh>
  )
}

export default Player
