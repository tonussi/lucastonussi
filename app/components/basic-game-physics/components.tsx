import { OrbitControls, PerspectiveCamera, useFBX, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'

import { Html, useProgress } from '@react-three/drei'
import { extend, type ThreeElements } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

// const color = new THREE.Color()

type GroundProps = ThreeElements['mesh'] & { bar: boolean }

function Ground({ bar, ...props }: GroundProps) {
  useEffect(() => {}, [bar])
  return (
    <mesh {...props}>
      <gridHelper args={[50, 50, 0x424242, 0x888888]} />
    </mesh>
  )
}

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(2)} % loaded</Html>
}

const PLayer = ({ refCamera }: { refCamera: RefObject<THREE.PerspectiveCamera> }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)

  const obj = useFBX('/models/low-poly/PlayerModel/Md_Char_Low_Poly_Man.fbx')
  obj.scale.set(0.01, 0.01, 0.01)

  const [keysPressed, setKeysPressed] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => ({
        ...prevKeys,
        [event.code.toLowerCase().replace('key', '')]: true,
      }))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => ({
        ...prevKeys,
        [event.code.toLowerCase().replace('key', '')]: false,
      }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    // Get camera's forward vector
    const camera = refCamera.current
    if (!camera) return

    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    // Calculate movement based on camera direction
    const moveSpeed = 0.6
    const movement = new THREE.Vector3()
    const oneVectorXZ = new THREE.Vector3(1, 0, 1)

    if (keysPressed.w) {
      // Rotate object to align with camera direction
      // Rotate object to face the direction of movement
      const targetRotation = Math.atan2(cameraDirection.x, cameraDirection.z)
      obj.rotation.y = targetRotation
      obj.translateOnAxis(oneVectorXZ.multiply(cameraDirection), moveSpeed)
    }

    if (keysPressed.s) {
      // Strafe backwards (perpendicular to camera direction)
      // Rotate object to face the opposite direction of camera
      const targetRotation = Math.atan2(-cameraDirection.x, -cameraDirection.z)
      obj.rotation.y = targetRotation
      obj.translateOnAxis(oneVectorXZ.multiply(cameraDirection), -moveSpeed)
    }

    if (keysPressed.a) {
      // Strafe left (perpendicular to camera direction)
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirection, camera.up).normalize()
      movement.add(right.clone().multiplyScalar(-moveSpeed))
    }

    if (keysPressed.d) {
      // Strafe right (perpendicular to camera direction)
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirection, camera.up).normalize()
      movement.add(right.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.space) {
      obj.translateOnAxis(new THREE.Vector3(0, 20, 0), 0.01)
      const timeout = setTimeout(() => {
        obj.translateOnAxis(new THREE.Vector3(0, -20, 0), 0.01)
      }, 200)
      return () => clearTimeout(timeout)
    }

    // Apply movement to mesh
    if (mesh.current) {
      mesh.current.position.add(movement)
      mesh.current.updateMatrix()
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1]}>
      <primitive object={obj} position={[0, 3, 0]} />
      <pointsMaterial
        color={'magenta'}
        size={0.02}
        transparent={true}
        sizeAttenuation={false}
        opacity={0.3}
      />
    </instancedMesh>
  )
}

const DungeonScene = () => {
  const gltf = useGLTF('/models/dungeons/dungeon.glb')
  const nodes = gltf.nodes
  console.log(nodes)
  return <primitive object={gltf.scene} scale={0.01} position={[0, 5, 50]} />
}

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)

  return (
    <Canvas
      ref={refCanvas}
      dpr={[1, 2]}
      fallback={
        <div className="bg-gray-100 dark:bg-gray-800 text-xs ounded-lg flex items-center justify-center">
          Sorry no WebGL supported!
        </div>
      }
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 rounded-lg"
      style={{
        height: '100vh',
      }}
    >
      <Suspense fallback={<Loader />}>
        <PerspectiveCamera
          ref={refCamera}
          makeDefault
          position={[10, 10, 10]}
          near={0.1}
          far={1000}
          zoom={0.5}
        />
        <ambientLight intensity={0.1} position={[0, 2000, 1000]} />
        <spotLight
          position={[55, 5, 20]}
          angle={0.15}
          penumbra={0.8}
          decay={0}
          intensity={Math.PI}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />
        <PLayer refCamera={refCamera} />
        <Ground bar={true} />
      </Suspense>
    </Canvas>
  )
}
