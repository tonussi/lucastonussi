import { OrbitControls } from '@react-three/drei'

import * as THREE from 'three'

function Controls({ camera }: { camera: THREE.PerspectiveCamera }) {
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
    />
  )
}

export default Controls
