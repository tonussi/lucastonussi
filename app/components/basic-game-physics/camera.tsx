import { PerspectiveCamera } from '@react-three/drei'
import { type RefObject } from 'react'

import * as THREE from 'three'

function CameraHelper({
  refCamera,
  refScene,
}: {
  refCamera: RefObject<THREE.PerspectiveCamera>
  refScene: RefObject<THREE.Scene>
}) {
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)

  return (
    <group ref={refCamera}>
      <PerspectiveCamera fov={60} near={1} />
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
