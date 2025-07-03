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
        fov={75}
        position={[5, 5, 5]}
        dispatchEvent={() => {}}
      />
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
