import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const CubeTravel = ({ position }: { position: THREE.Vector3 }) => {
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
    <RigidBody ref={rigidBody} colliders="cuboid" position={position} type="dynamic">
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={Math.random() * 0xffffff}
          wireframe
          opacity={0.5}
          transparent
        />
      </mesh>
    </RigidBody>
  )
}

export default CubeTravel
