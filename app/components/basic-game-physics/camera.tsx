import { PerspectiveCamera } from '@react-three/drei'
import { type RefObject } from 'react'

import * as THREE from 'three'
import Controls from './controls'

function CameraHelper({ refCamera }: { refCamera: RefObject<THREE.PerspectiveCamera> }) {
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)

  return (
    <group>
      <PerspectiveCamera ref={refCamera} fov={60} near={1} far={1000} makeDefault castShadow />
      <Controls camera={camera} />
      {/* <cameraHelper name="camera" args={[camera]} /> */}
    </group>
  )
}

export default CameraHelper
