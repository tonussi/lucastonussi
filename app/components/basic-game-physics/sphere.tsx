import { useMemo } from 'react'

import { BallCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

function SphereOfPointsWithPhysics() {
  const pointsData = useMemo(() => {
    const sphereGeometry = new THREE.SphereGeometry(5, 30, 30)
    // Use an array of numbers for the position attribute
    const positions = new Float32Array(sphereGeometry.attributes.position.count * 3)
    const pointPositions = [] // To store Vector3 for RigidBody

    for (let i = 0; i < sphereGeometry.attributes.position.count; i++) {
      const vertex = sphereGeometry.attributes.position.array[i]
      const x = vertex * Math.cos(i)
      const y = vertex * Math.sin(i)
      const z = vertex * Math.cos(i)
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      pointPositions.push(new THREE.Vector3(x, y, z))
    }

    return { positions, pointPositions }
  }, [])

  return (
    <>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={pointsData.positions}
            count={pointsData.positions.length / 3}
            itemSize={3}
            args={[pointsData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.01} sizeAttenuation opacity={0} transparent />
      </points>

      {pointsData.pointPositions.map((pos, index) => (
        <RigidBody key={index} colliders={false} position={pos}>
          {/* Optionally, you can add a small mesh inside the RigidBody to visualize its collider */}
          <mesh>
            <sphereGeometry args={[0.01, 64, 64]} />
            <meshBasicMaterial color="magenta" transparent />
            <BallCollider args={[0.1]} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

export default SphereOfPointsWithPhysics
