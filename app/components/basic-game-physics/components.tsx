import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'

import { Html, useProgress } from '@react-three/drei'
import { extend, type ThreeElements } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'

import { Fullscreen } from 'lucide-react'
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
  const [fbxExists, setFbxExists] = useState(false)
  const [bullets, setProjectiles] = useState<THREE.Mesh[]>([])

  useEffect(() => {
    const checkFbxExists = async () => {
      try {
        const response = await fetch('/models/misc/skeleton/pirate.glb', {
          cache: 'force-cache',
        })
        setFbxExists(response.ok)
      } catch (error) {
        console.error('Error checking FBX file:', error)
        setFbxExists(false)
      }
    }
    checkFbxExists()
  }, [])

  if (fbxExists) {
    const { scene, nodes, animations } = useGLTF('/models/misc/skeleton/pirate.glb')
    console.log(nodes, animations)
    obj = scene
  } else {
    obj = new THREE.Group()
    const box = new THREE.BoxGeometry(25, 200, 25)
    box.translate(0, 100, 0)
    const material = new THREE.MeshBasicMaterial({ color: 'magenta', wireframe: true })
    const boxMesh = new THREE.Mesh(box, material)
    obj.add(boxMesh)
  }

  obj.scale.set(0.001, 0.001, 0.001)

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
    isLeft: boolean
    isMiddle: boolean
    isRight: boolean
  }>({
    x: 0,
    y: 0,
    isLeft: false,
    isMiddle: false,
    isRight: false,
  })

  const handleMouse = (event: MouseEvent) => {
    setMouse({
      x: event.clientX,
      y: event.clientY,
      isLeft: event.buttons === 1,
      isRight: event.buttons === 2,
      isMiddle: event.buttons === 4,
    })
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mousedown', handleMouse)
    window.addEventListener('mouseup', handleMouse)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mousedown', handleMouse)
      window.removeEventListener('mouseup', handleMouse)
    }
  }, [])

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

    if (mouse.isLeft) {
      // Create bullets in front of the character
      const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

      // Get the character's current position and forward direction
      const characterPosition = mesh.current.position.clone()
      const forwardDirection = new THREE.Vector3(
        cameraDirection.x,
        0,
        cameraDirection.z
      ).normalize()

      // Create bullets positioned in front of the character
      const projectiles = new THREE.Mesh(boxGeometry, boxMaterial)

      // Position bullets 8 units in front of the character
      const bulletPosition = characterPosition
        .clone()
        .add(forwardDirection.clone().multiplyScalar(8))
      projectiles.position.copy(bulletPosition)

      // Make the box face the direction it's being thrown
      const targetRotation = Math.atan2(forwardDirection.x, forwardDirection.z)
      projectiles.rotation.y = targetRotation

      // Add bullet to the scene and array
      refScene.current?.add(projectiles)
      bullets.push(projectiles)

      // Update bullets state
      // setProjectiles((prevBullets) => [...prevBullets, ...bullets])

      // Clear bullets after 5 seconds
      // setTimeout(() => {
      //   bullets.forEach((bullet) => {
      //     refScene.current?.remove(bullet)
      //     bullet.geometry.dispose()
      //     if (bullet.material instanceof THREE.Material) {
      //       bullet.material.dispose()
      //     }
      //   })
      //   setProjectiles((prevBullets) => prevBullets.filter((bullet) => !bullets.includes(bullet)))
      // }, 100)
    }

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
      // if (!mouse.isRight) {
      //   // Update camera to follow player from behind
      //   const cameraOffset = new THREE.Vector3(0, 9, 18) // Offset behind and above player
      //   const targetCameraPosition = mesh.current.position.clone().add(cameraOffset)

      //   // Smooth camera movement
      //   refCamera.current.position.lerp(targetCameraPosition, 0.1)

      //   // Make camera look at player
      //   refCamera.current.lookAt(mesh.current.position)
      // }

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

interface SavedProps {
  height: string
  width: string
  position: string
  top: string
  left: string
  zIndex: string
  overflow: string
  margin: string
  padding: string
  borderRadius: string
}

const DungeonScene = ({ active }: { active: boolean }) => {
  const [glbExists, setGlbExists] = useState(false)

  useEffect(() => {
    const checkFbxExists = async () => {
      try {
        const response = await fetch('/models/dungeons/dungeon.glb')
        setGlbExists(response.ok)
      } catch (error) {
        console.error('Error checking FBX file:', error)
        setGlbExists(false)
      }
    }
    checkFbxExists()
  }, [])

  if (!glbExists) {
    const gltf = useGLTF('/models/dungeons/dungeon.glb')
    // const nodes = gltf.nodes
    return active && <primitive object={gltf.scene} scale={0.01} position={[0, 5, 50]} />
  }
}

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const refPlayer = useRef<THREE.Mesh>(null!)
  const gameContainerRef = useRef<HTMLDivElement>(null!)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedProps, setSavedProps] = useState<SavedProps>({} as SavedProps)

  return (
    <div ref={gameContainerRef} className="rounded-lg overflow-hidden">
      <Fullscreen
        size={24}
        color="white"
        className="absolute top-4 right-4 z-10"
        onClick={() => {
          if (isFullscreen) {
            setIsFullscreen(false)
            setSavedProps({
              height: gameContainerRef.current.style.height,
              width: gameContainerRef.current.style.width,
              position: gameContainerRef.current.style.position,
              top: gameContainerRef.current.style.top,
              left: gameContainerRef.current.style.left,
              zIndex: gameContainerRef.current.style.zIndex,
              overflow: gameContainerRef.current.style.overflow,
              margin: gameContainerRef.current.style.margin,
              padding: gameContainerRef.current.style.padding,
              borderRadius: gameContainerRef.current.style.borderRadius,
            })
            if (gameContainerRef.current) {
              gameContainerRef.current.style.height = '100vh'
              gameContainerRef.current.style.width = '100vw'
              gameContainerRef.current.style.position = 'fixed'
              gameContainerRef.current.style.top = '0'
              gameContainerRef.current.style.left = '0'
              gameContainerRef.current.style.zIndex = '1000'
              gameContainerRef.current.style.overflow = 'hidden'
              gameContainerRef.current.style.margin = '0'
              gameContainerRef.current.style.padding = '0'
              gameContainerRef.current.style.borderRadius = '0px'
            }
          } else {
            setIsFullscreen(true)
            if (gameContainerRef.current) {
              gameContainerRef.current.style.height = savedProps.height
              gameContainerRef.current.style.width = savedProps.width
              gameContainerRef.current.style.position = savedProps.position
              gameContainerRef.current.style.top = savedProps.top
              gameContainerRef.current.style.left = savedProps.left
              gameContainerRef.current.style.zIndex = savedProps.zIndex
              gameContainerRef.current.style.overflow = savedProps.overflow
              gameContainerRef.current.style.margin = savedProps.margin
              gameContainerRef.current.style.padding = savedProps.padding
              gameContainerRef.current.style.borderRadius = savedProps.borderRadius
            }
          }
        }}
      />
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        ref={refCanvas}
        dpr={[1, 2]}
        fallback={
          <div className="bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">
            Sorry no WebGL supported!
          </div>
        }
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800"
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
            <hemisphereLight intensity={0.15} groundColor="black" />
            <ambientLight name="ambientLight" intensity={10} position={[0, 1000, 0]} />
            <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              zoomSpeed={Math.PI / 2}
              panSpeed={Math.PI / 2}
              // rotate around the player
              rotateSpeed={Math.PI / 2}
              mouseButtons={{
                RIGHT: THREE.MOUSE.ROTATE,
              }}
            />
            <Ground active={true} />
            {/* <DungeonScene active={false} /> */}
          </scene>
        </Suspense>
      </Canvas>
    </div>
  )
}
