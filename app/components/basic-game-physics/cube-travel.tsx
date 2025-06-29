import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'

const CubeTravel = () => {
  const rigidBody = useRef<RapierRigidBody>(null)

  useEffect(() => {
    if (rigidBody.current) {
      // Example: Move the cube 1 unit along the x-axis every frame.
      const force = { x: 10, y: 0, z: 0 }
      rigidBody.current.addForce(force, true)

      // Example: Rotate the cube 0.1 radians around the y-axis every frame.
      const torque = { x: 0, y: 0.1, z: 0 }
      rigidBody.current.addTorque(torque, true)
    }
  }, [])

  return (
    <RigidBody ref={rigidBody} colliders="cuboid" position={[0, 1, 0]} type="dynamic">
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  )
}

export default CubeTravel
