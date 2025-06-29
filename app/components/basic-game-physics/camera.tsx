import { extend } from '@react-three/fiber'
import { type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

function CameraHelper({ refCamera }: { refCamera: RefObject<THREE.PerspectiveCamera> }) {
  // fov: 60,
  // near: 1,
  // far: 1000,
  // rotation: [-0.3, 0, 0],
  // position: [0, 10, 10],
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)
  camera.position.set(0, 10, 10)
  camera.rotation.set(-0.3, 0, 0)
  camera.updateMatrixWorld()
  return (
    <group ref={refCamera}>
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
