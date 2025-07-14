import { PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'

import * as THREE from 'three'
import Controls from './controls'

function CameraFollower({ refScene }: { refScene: React.RefObject<THREE.Scene> }) {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const offset = new THREE.Vector3(0, 5, -10)
  const player = refScene.current?.getObjectByName('player') as THREE.Group

  return (
    <group>
      <PerspectiveCamera
        name="camera"
        makeDefault
        ref={refCamera}
        fov={75}
        position={[0, 5, 5]}
        dispatchEvent={() => {}}
      />
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
