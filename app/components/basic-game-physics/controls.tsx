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
      // maxDistance={15}
      // minDistance={1}
      // minAzimuthAngle={-Math.PI / 2}
      // maxAzimuthAngle={Math.PI / 2}
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
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      keys={{
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown',
      }}
    />
  )
}

export default Controls
