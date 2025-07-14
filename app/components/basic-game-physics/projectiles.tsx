import useInputHandler from './input-handler'

import { extend } from '@react-three/fiber'
import { useEffect, useState, type RefObject } from 'react'

import * as THREE from 'three'
import CubeTravel from './cube-travel'
extend(THREE as any)

const Projectiles = ({ refScene }: { refScene: RefObject<THREE.Scene> }) => {
  const { mouse } = useInputHandler()

  const [bullets, setProjectiles] = useState<THREE.Vector3[]>([])
  const player = refScene.current?.getObjectByName('player') as THREE.Group

  useEffect(() => {
    if (bullets.length > 5) setProjectiles([])
    handleLeftMouseClick()
    handleProjectilesAnimations()
  }, [mouse])

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

      setProjectiles([...bullets])
    }
  }

  return (
    <>
      {bullets.map((bullet, index) => (
        <CubeTravel key={index} player={player} position={bullet} />
      ))}
    </>
  )
}

export default Projectiles
