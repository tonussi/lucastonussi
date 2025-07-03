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
        fov={20}
        near={0.1}
        far={100}
        position={[0, 5, 5]}
        dispatchEvent={() => {
          console.log('camera')
        }}
        rotation={[-0.5 * Math.PI, 0.5 * Math.PI, 0]}
      />
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
