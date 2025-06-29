import { extend } from '@react-three/fiber'
import { type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

function CameraHelper({
  refCamera,
  refScene,
}: {
  refCamera: RefObject<THREE.PerspectiveCamera>
  refScene: RefObject<THREE.Scene>
}) {
  // fov: 60,
  // near: 1,
  // far: 1000,
  // rotation: [-0.3, 0, 0],
  // position: [0, 10, 10],
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)

  camera.updateMatrixWorld()
  return (
    <group ref={refCamera}>
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
