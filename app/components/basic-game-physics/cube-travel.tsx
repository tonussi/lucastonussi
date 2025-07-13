import { useFrame } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const CubeTravel = ({ position, player }: { position: THREE.Vector3; player: THREE.Object3D }) => {
  const rigidBody = useRef<RapierRigidBody>(null)
  const [color, setColor] = useState(Math.random() * 0xffffff)
  const [increasing, setIncreasing] = useState(0)
  const maxDistance = 5
  const speed = 0.1

  useFrame(() => {
    if (rigidBody.current) {
      // Get the camera's forward vector and normalize it
      const forward = new THREE.Vector3(0, 0, -1)
      forward.applyQuaternion(player.quaternion)

      // Project the forward vector onto the ground plane (y=0)
      const groundForward = forward.clone()
      groundForward.y = 0
      groundForward.normalize()

      // Calculate the force vector
      const force = {
        x: -groundForward.x,
        y: 0,
        z: -groundForward.z,
      }

      // Apply force in the forward direction
      rigidBody.current.addForce(force, true)

      // Calculate torque to make the cube roll
      // We want to rotate around the axis perpendicular to both forward and up
      const up = new THREE.Vector3(0, 1, 0)
      const rollAxis = groundForward.clone().cross(up)
      rollAxis.normalize()

      // Calculate torque magnitude based on speed
      const torqueMag = speed * 10 // Adjust multiplier for desired roll speed

      // Apply torque
      rigidBody.current.addTorque(
        {
          x: rollAxis.x * torqueMag,
          y: rollAxis.y * torqueMag,
          z: rollAxis.z * torqueMag,
        },
        true
      )
    }

    // Increase time but with a max limit
    setIncreasing(Math.min(increasing + 0.01, maxDistance / speed))
  })

  return (
    <RigidBody ref={rigidBody} colliders="cuboid" position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} opacity={0.5} transparent />
      </mesh>
    </RigidBody>
  )
}

export default CubeTravel
