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
      <directionalLight
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        intensity={10}
        castShadow
      >
        <PerspectiveCamera
          makeDefault
          name="camera"
          ref={refCamera}
          fov={65}
          near={0.1}
          position={[0, 5, -10]}
          dispatchEvent={() => {}}
        />
      </directionalLight>
      <Controls camera={refCamera.current} />
    </group>
  )
}

export default CameraFollower
