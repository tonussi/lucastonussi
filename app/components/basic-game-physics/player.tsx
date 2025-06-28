import useInputHandler from './input-handler'
import usePlayerModel from './model-loader'

import { useFrame } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { useRef, useState, type RefObject } from 'react'

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

  const { keysPressed, mouse } = useInputHandler()

  const { obj, fbxExists } = usePlayerModel()

  const [bullets, setProjectiles] = useState<THREE.Mesh[]>([])

  // Only proceed if obj is loaded
  if (!obj) {
    return null
  }

  obj.scale.set(0.001, 0.001, 0.001)

  // Make all materials wireframe
  if (obj) {
    obj.traverse((child) => {
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

  const skeleton = new THREE.SkeletonHelper(obj)
  skeleton.visible = true
  refScene.current?.add(skeleton)

  const axesHelper = new THREE.AxesHelper(10)
  mesh.current?.add(axesHelper)

  useFrame(() => {
    // Get camera's forward vector
    const camera = refCamera.current
    if (!camera) return

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    // Calculate movement based on camera direction
    const moveSpeed = 0.09
    const movement = new THREE.Vector3()

    if (mouse.isLeft) {
      // Create bullets in front of the character
      const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })

      // Get the character's current position and forward direction
      const characterPosition = mesh.current.position.clone()
      const forwardDirection = new THREE.Vector3(
        characterPosition.x,
        0,
        characterPosition.z
      ).normalize()

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
      }, 100)
    }

    if (keysPressed.w) {
      // The projection make the vector translate to the obj forward direction
      const cameraDirectionClone = cameraDirection.clone()
      const projectedDirection = new THREE.Vector3(
        -cameraDirectionClone.x,
        0,
        -cameraDirectionClone.z
      ).normalize()
      const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
      obj.rotation.y = targetRotation
      movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.s) {
      // The projection make the vector translate to the obj backwards direction
      const cameraDirectionClone = cameraDirection.clone()
      const projectedDirection = new THREE.Vector3(
        cameraDirectionClone.x,
        0,
        cameraDirectionClone.z
      ).normalize()
      const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
      obj.rotation.y = targetRotation
      movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.a) {
      // Strafe left (perpendicular to camera direction)
      const cameraDirectionClone = cameraDirection.clone()
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirectionClone, camera.up).normalize()
      // Rotate object to face the direction of movement (left)
      const targetRotation = Math.atan2(right.x, right.z)
      obj.rotation.y = targetRotation
      movement.add(right.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.d) {
      // Strafe right (perpendicular to camera direction)
      const cameraDirectionClone = cameraDirection.clone()
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirectionClone, camera.up).normalize()
      // Rotate object to face the direction of movement (right)
      const targetRotation = Math.atan2(-right.x, -right.z)
      obj.rotation.y = targetRotation
      movement.add(right.clone().multiplyScalar(-moveSpeed))
    }

    // Apply movement to mesh
    if (mesh.current) {
      mesh.current.position.add(movement)

      // Update camera to follow behind the player
      // refCamera.current.lookAt(mesh.current.position)
      cameraDirection.add(movement)

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
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1]}>
      <primitive object={obj} position={[0, 0, 0]} />
    </instancedMesh>
  )
}

export default Player
