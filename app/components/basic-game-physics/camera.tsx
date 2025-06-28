import { extend } from '@react-three/fiber'
import { type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

function CameraHelper({ refCamera }: { refCamera: RefObject<THREE.PerspectiveCamera> }) {
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)
  return (
    <group position={[0, 2, -5]} rotation={[0, Math.PI, 0]} ref={refCamera}>
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
