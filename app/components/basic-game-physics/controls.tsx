import { OrbitControls } from '@react-three/drei'
import { extend, useThree } from '@react-three/fiber'

import * as THREE from 'three'
extend(THREE as any)

function Controls() {
  const {
    camera,
    gl: { domElement },
  } = useThree()

  // TODO: use refCamera.current
  return (
    <OrbitControls
      camera={camera}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      zoomSpeed={Math.PI / 2}
      panSpeed={Math.PI / 2}
      rotateSpeed={Math.PI / 2}
      mouseButtons={{
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
    />
  )
}

export default Controls
