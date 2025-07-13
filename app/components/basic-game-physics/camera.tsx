import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import * as THREE from 'three'
import Controls from './controls'

function CameraFollower({ refScene }: { refScene: React.RefObject<THREE.Scene> }) {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const offset = new THREE.Vector3(0, 5, -10)
  const playerRef = refScene.current?.getObjectByName('player') as THREE.Object3D

  useFrame(() => {
    if (playerRef.current && refCamera.current) {
      // Desired camera position
      const desiredPosition = playerRef.current.position.clone().add(offset)
      // Smoothly interpolate camera position
      refCamera.current.position.lerp(desiredPosition, 0.1)
      // Always look at the player
      refCamera.current.lookAt(playerRef.current.position)
    }
  })

  return (
    <group>
      <PerspectiveCamera
        name="camera"
        makeDefault
        ref={refCamera}
        fov={75}
        position={[0, 5, 5]}
        dispatchEvent={() => {}}
      />
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
