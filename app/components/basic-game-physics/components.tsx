import { OrbitControls, PerspectiveCamera, useFBX, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'

import { Html, useProgress } from '@react-three/drei'
import { extend, type ThreeElements } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'
extend(THREE as any)

// const color = new THREE.Color()

type GroundProps = ThreeElements['mesh'] & { active: boolean }

function Ground({ active, ...props }: GroundProps) {
  useEffect(() => {}, [active])
  return <mesh {...props}>{active && <gridHelper args={[50, 50, 0x424242, 0x888888]} />}</mesh>
}

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(2)} % loaded</Html>
}

const Player = ({
  refCamera,
  refScene,
  refPlayer,
}: {
  refCamera: RefObject<THREE.PerspectiveCamera>
  refScene: RefObject<THREE.Scene>
  refPlayer: RefObject<THREE.Mesh>
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  let obj: THREE.Group | null = null
  obj = useFBX('/models/low-poly/PlayerModel/Md_Char_Low_Poly_Man.fbx') as THREE.Group
  const box = new THREE.BoxGeometry(5, 5, 5)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const boxMesh = new THREE.Mesh(box, material)
  obj.add(boxMesh)

  obj.scale.set(0.01, 0.01, 0.01)

  const [keysPressed, setKeysPressed] = useState<{
    w: boolean
    a: boolean
    s: boolean
    d: boolean
    space: boolean
  }>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  })

  const [mouse, setMouse] = useState<{
    x: number
    y: number
    isDown: boolean
    isLeft: boolean
    isRight: boolean
    isUp: boolean
  }>({
    x: 0,
    y: 0,
    isDown: false,
    isLeft: false,
    isRight: false,
    isUp: false,
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
    const moveSpeed = 0.07
    const movement = new THREE.Vector3()

    if (keysPressed.w) {
      // The projection make the vector translate to the obj forward direction
      const projectedDirection = new THREE.Vector3(
        cameraDirection.x,
        0,
        cameraDirection.z
      ).normalize()
      const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
      obj.rotation.y = targetRotation
      movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.s) {
      // The projection make the vector translate to the obj backwards direction
      const projectedDirection = new THREE.Vector3(
        -cameraDirection.x,
        0,
        -cameraDirection.z
      ).normalize()
      const targetRotation = Math.atan2(projectedDirection.x, projectedDirection.z)
      obj.rotation.y = targetRotation
      movement.add(projectedDirection.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.a) {
      // Strafe left (perpendicular to camera direction)
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirection, camera.up).normalize()
      // Rotate object to face the direction of movement (left)
      const targetRotation = Math.atan2(-right.x, -right.z)
      obj.rotation.y = targetRotation
      movement.add(right.clone().multiplyScalar(-moveSpeed))
    }

    if (keysPressed.d) {
      // Strafe right (perpendicular to camera direction)
      const right = new THREE.Vector3()
      right.crossVectors(cameraDirection, camera.up).normalize()
      // Rotate object to face the direction of movement (right)
      const targetRotation = Math.atan2(right.x, right.z)
      obj.rotation.y = targetRotation
      movement.add(right.clone().multiplyScalar(moveSpeed))
    }

    if (keysPressed.space) {
      //obj.translateOnAxis(new THREE.Vector3(0, 20, 0), 0.01)
      // const timeout = setTimeout(() => {
      //   obj.translateOnAxis(new THREE.Vector3(0, -20, 0), 0.01)
      // }, 200)
      // return () => clearTimeout(timeout)
    }

    // Apply movement to mesh
    if (mesh.current) {
      // // Update camera to follow the player from behind
      // const cameraOffset = new THREE.Vector3(0, 5, 10) // Offset behind and above the player
      // const targetCameraPosition = mesh.current.position.clone().add(cameraOffset)

      // // Smooth camera movement
      // const cameraSmoothness = 0.05
      // camera.position.lerp(targetCameraPosition, cameraSmoothness)

      // // Make camera look at the player
      // camera.lookAt(mesh.current.position)
      mesh.current.position.add(movement)
      // Update spotlight to follow the player
      const spotlight = refScene.current.getObjectByName('spotlight')
      if (spotlight && spotlight instanceof THREE.SpotLight) {
        spotlight.position.copy(mesh.current.position)
        spotlight.position.y += 5 // Keep spotlight above the player
        spotlight.target.position.copy(mesh.current.position)
        spotlight.target.updateMatrixWorld()
      }
      mesh.current.updateMatrix()
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1]}>
      <primitive object={obj} position={[0, 0, 0]} />
    </instancedMesh>
  )
}

const DungeonScene = ({ active }: { active: boolean }) => {
  const gltf = useGLTF('/models/dungeons/dungeon.glb')
  // const nodes = gltf.nodes
  return active && <primitive object={gltf.scene} scale={0.01} position={[0, 5, 50]} />
}

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const refPlayer = useRef<THREE.Mesh>(null!)

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
        <scene ref={refScene}>
          <Player refCamera={refCamera} refScene={refScene} refPlayer={refPlayer} />
          <PerspectiveCamera
            name="camera"
            ref={refCamera}
            makeDefault
            position={[9, 9, 9]}
            zoom={1}
          />
          <ambientLight name="ambientLight" intensity={0.1} position={[0, 1000, 0]} />
          <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={Math.PI / 2}
            panSpeed={Math.PI / 2}
            // rotate around the player
            rotateSpeed={Math.PI / 2}
          />
          <Ground active={true} />
          <DungeonScene active={false} />
        </scene>
      </Suspense>
    </Canvas>
  )
}
