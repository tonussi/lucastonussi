import { PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'

import * as THREE from 'three'
import Controls from './controls'

function CameraFollower() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)

  return (
    <group>
      <PerspectiveCamera
        name="camera"
        makeDefault
        ref={refCamera}
        fov={60}
        near={1}
        far={2000}
        position={[0, 20, 20]}
        rotation={[-0.5 * Math.PI, 0, 0]}
      />
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
