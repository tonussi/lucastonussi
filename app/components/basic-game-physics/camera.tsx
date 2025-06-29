import { extend } from '@react-three/fiber'
import { type RefObject, useEffect } from 'react'

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
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 3)

  useEffect(() => {
    if (refScene.current) {
      console.log(refScene.current.position)

      camera.position.copy(refScene.current.position)
      camera.rotation.set(-0.3, 0, 0)
      camera.position.set(
        refScene.current.position.x,
        refScene.current.position.y + 5,
        refScene.current.position.z + 9
      )
      camera.lookAt(refScene.current.position)
      camera.updateMatrixWorld()
    }
  }, [])

  return (
    <group ref={refCamera}>
      <cameraHelper name="camera" args={[camera]} />
    </group>
  )
}

export default CameraHelper
