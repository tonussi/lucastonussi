import { extend } from '@react-three/fiber'
import { type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

function CameraHelper({ refCamera }: { refCamera: RefObject<THREE.PerspectiveCamera> }) {
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)
  camera.position.set(0, 10, 10)
  camera.rotation.set(-0.3, 0, 0)
  return (
    <group ref={refCamera}>
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
