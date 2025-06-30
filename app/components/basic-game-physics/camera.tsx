import { PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'

import * as THREE from 'three'
import Controls from './controls'

function CameraFollower() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)

  return (
    <group>
      <PerspectiveCamera name="camera" ref={refCamera} fov={60} position={[0, 20, 20]} />
      <Controls camera={refCamera.current} />
      {/* <cameraHelper name="camera" args={[camera]} /> */}
    </group>
  )
}

export default CameraFollower
