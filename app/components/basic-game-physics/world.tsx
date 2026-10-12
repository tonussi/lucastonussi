import { Canvas, extend, useFrame, type RootState } from '@react-three/fiber'
import {
  Box,
  KeyboardControls,
  OrthographicCamera,
  Sky,
  Torus,
  TorusKnot,
  useGLTF,
} from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import { Leva } from 'leva'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import CameraFollower from './camera'
import { CharacterController } from './character-controller'
import { GRAVITY } from './constants'
import EditorCamera from './editor-camera'
import EngineSceneObjects from './engine-scene-objects'
import FullscreenWrapper from './fullscreen'
import useGamepad from './gamepad'
import ImpactBurst from './impact-burst'
import PercentageProgress from './progress'
import Projectiles from './projectiles'
import Rotator from './rotator'
import GameInterface from './ui/interface'
import type {
  EngineSceneObject,
  EngineWorldSettings,
  ProceduralSettings,
  SceneObjectKind,
} from '../game-engine/types'

extend(THREE as any)

const OCEAN_SIZE = 180
const OCEAN_SEGMENTS = 64
const OCEAN_LEVEL = -50.6
const SHIP_POSITION: [number, number, number] = [0, -49.35, 0]
const SHIP_SCALE = 6
const SHIP_MODEL_SCALE = 0.00113
const SHIP_MODEL_PATH = '/models/pirate-ship/pirate_ship.glb'

const COMPASS_SOURCES = [
  { name: 'N', x: 0, z: -1 },
  { name: 'NE', x: 1, z: -1 },
  { name: 'E', x: 1, z: 0 },
  { name: 'SE', x: 1, z: 1 },
  { name: 'S', x: 0, z: 1 },
  { name: 'SW', x: -1, z: 1 },
  { name: 'W', x: -1, z: 0 },
  { name: 'NW', x: -1, z: -1 },
] as const

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'attack', keys: ['KeyF'] },
]

function Ocean({ level = OCEAN_LEVEL }: { level?: number }) {
  const geometryRef = useRef<THREE.PlaneGeometry>(null)
  const basePositions = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(OCEAN_SIZE, OCEAN_SIZE, OCEAN_SEGMENTS, OCEAN_SEGMENTS)
    const positions = new Float32Array(geometry.attributes.position.array)
    geometry.dispose()
    return positions
  }, [])
  const waves = useMemo(() => {
    const source = COMPASS_SOURCES[Math.floor(Math.random() * COMPASS_SOURCES.length)]
    const sourceLength = Math.hypot(source.x, source.z)
    const travelX = -source.x / sourceLength
    const travelZ = -source.z / sourceLength

    return Array.from({ length: 7 }, (_, index) => {
      const variation = (Math.random() - 0.5) * 0.48
      const baseAngle = Math.atan2(travelZ, travelX) + variation
      const wavelength = 7 + Math.random() * 23

      return {
        amplitude: 0.06 + Math.random() * (index < 2 ? 0.24 : 0.13),
        directionX: Math.cos(baseAngle),
        directionZ: Math.sin(baseAngle),
        frequency: (Math.PI * 2) / wavelength,
        phase: Math.random() * Math.PI * 2,
        speed: 0.45 + Math.random() * 1.35,
        steepness: 0.025 + Math.random() * 0.07,
      }
    })
  }, [])

  useFrame(({ clock }) => {
    const positions = geometryRef.current?.attributes.position
    if (!positions) return

    const time = clock.getElapsedTime()
    for (let index = 0; index < positions.count; index += 1) {
      const x = basePositions[index * 3]
      const y = basePositions[index * 3 + 1]
      let height = 0
      let offsetX = 0
      let offsetZ = 0

      for (const wave of waves) {
        // The plane's local Y axis maps to negative world Z after its rotation.
        const phase =
          (x * wave.directionX - y * wave.directionZ) * wave.frequency -
          time * wave.speed +
          wave.phase
        const crest = Math.cos(phase)
        height += Math.sin(phase) * wave.amplitude
        offsetX += crest * wave.directionX * wave.steepness
        offsetZ += crest * wave.directionZ * wave.steepness
      }

      positions.setXYZ(index, x + offsetX, y - offsetZ, height)
    }
    positions.needsUpdate = true
    geometryRef.current?.computeVertexNormals()
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={level} receiveShadow>
      <planeGeometry
        ref={geometryRef}
        args={[OCEAN_SIZE, OCEAN_SIZE, OCEAN_SEGMENTS, OCEAN_SEGMENTS]}
      />
      <meshStandardMaterial color="#064b70" roughness={0.18} metalness={0.28} />
    </mesh>
  )
}

function PirateShipModel() {
  const { scene } = useGLTF(SHIP_MODEL_PATH)
  const model = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [model])

  return (
    <primitive
      object={model}
      position={[0, 0.15, 0]}
      rotation-y={Math.PI / 2}
      scale={SHIP_MODEL_SCALE}
    />
  )
}

function PirateShip({
  height = SHIP_POSITION[1],
  scale = SHIP_SCALE,
}: {
  height?: number
  scale?: number
}) {
  const shipVisual = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!shipVisual.current) return
    const time = clock.getElapsedTime()
    shipVisual.current.rotation.z = Math.sin(time * 0.75) * 0.025
    shipVisual.current.rotation.x = Math.sin(time * 0.52) * 0.015
  })

  return (
    <RigidBody
      type="fixed"
      colliders="trimesh"
      position={[SHIP_POSITION[0], height, SHIP_POSITION[2]]}
      scale={scale}
    >
      {/* The fixed collision mesh is generated from the ship GLB itself. */}
      <group ref={shipVisual}>
        <PirateShipModel />
      </group>
    </RigidBody>
  )
}

useGLTF.preload(SHIP_MODEL_PATH)

function seededRandom(seed: number) {
  let state = Math.max(1, Math.floor(seed)) % 2147483647
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function ProceduralMarkers({ settings }: { settings: ProceduralSettings }) {
  const markers = useMemo(() => {
    const random = seededRandom(settings.seed)
    return Array.from({ length: settings.count }, (_, index) => {
      const angle = random() * Math.PI * 2
      const distance = 3 + random() * Math.max(0, settings.radius - 3)
      return {
        id: `${settings.seed}-${index}`,
        position: [
          Math.cos(angle) * distance,
          -9.45 + random() * 0.8,
          Math.sin(angle) * distance,
        ] as [number, number, number],
        scale: 0.12 + random() * 0.24,
      }
    })
  }, [settings.count, settings.radius, settings.seed])

  if (!settings.enabled) return null

  return (
    <group>
      {markers.map((marker) => (
        <mesh key={marker.id} position={marker.position} scale={marker.scale} castShadow>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#d8a64d" emissive="#6f4b18" emissiveIntensity={0.45} />
        </mesh>
      ))}
    </group>
  )
}

interface BasicGamePhysicsProps {
  worldSettings?: EngineWorldSettings
  proceduralSettings?: ProceduralSettings
  editorMode?: boolean
  isPlaying?: boolean
  sceneObjects?: EngineSceneObject[]
  selectedSceneObjectId?: string
  onSelectSceneObject?: (id: string) => void
  onCreateSceneObject?: (kind: SceneObjectKind, position: [number, number, number]) => void
  onUpdateSceneObject?: (id: string, patch: Partial<EngineSceneObject>) => void
  transformMode?: 'translate' | 'rotate' | 'scale'
  snapEnabled?: boolean
  debugColliders?: boolean
}

export default function BasicGamePhysics({
  worldSettings,
  proceduralSettings,
  editorMode = false,
  isPlaying = true,
  sceneObjects = [],
  selectedSceneObjectId,
  onSelectSceneObject,
  onCreateSceneObject,
  onUpdateSceneObject,
  transformMode = 'translate',
  snapEnabled = true,
  debugColliders = false,
}: BasicGamePhysicsProps) {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const [torusPositions, setTorusPositions] = useState<{ x: number; z: number }[]>([])
  const [impactBursts, setImpactBursts] = useState<
    Array<{ id: number; position: [number, number, number] }>
  >([])
  const nextImpactId = useRef(0)
  const canvasState = useRef<RootState | null>(null)
  const gamepad = useGamepad()

  useEffect(() => {
    const positions = Array.from({ length: 10 }, () => ({
      x: Math.random() * 20 - 10,
      z: Math.random() * 20 - 10,
    }))
    setTorusPositions(positions)
  }, [])

  const handleTorusRotation = () => {
    setTorusRotation((rotation) => rotation + 0.01)
  }

  const handleAttack = (position: [number, number, number]) => {
    nextImpactId.current += 1
    setImpactBursts((bursts) => [...bursts, { id: nextImpactId.current, position }])
  }

  const handleObjectDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const kind = event.dataTransfer.getData('application/x-world-object') as SceneObjectKind
    const state = canvasState.current
    if (!kind || !state || !onCreateSceneObject) return

    const bounds = refCanvas.current.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 9.35)
    const placement = new THREE.Vector3()
    raycaster.setFromCamera(pointer, state.get().camera)

    if (raycaster.ray.intersectPlane(placementPlane, placement)) {
      onCreateSceneObject(kind, [placement.x, placement.y, placement.z])
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTorusRotation((rotation) => rotation + 0.01)
    }, 10)
    return () => clearInterval(interval)
  }, [])

  const isMobile =
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const shadowCameraRef = useRef<THREE.OrthographicCamera>(null!)

  return (
    <FullscreenWrapper showControls={!editorMode}>
      <Leva hidden={editorMode} />
      {isMobile && <GameInterface />}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          fallback={'Sorry no WebGL supported!'}
          style={{ height: '100%' }}
          ref={refCanvas}
          dpr={[1, 1.5]}
          shadows
          onCreated={(state) => {
            canvasState.current = state
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleObjectDrop}
        >
          <color attach="background" args={['#6fa2b9']} />
          <fog
            attach="fog"
            args={['#6fa2b9', worldSettings?.fogNear ?? 16, worldSettings?.fogFar ?? 78]}
          />
          <Sky
            distance={450000}
            sunPosition={[-75, 36, -65]}
            turbidity={7}
            rayleigh={1.2}
            mieCoefficient={0.006}
          />
          <directionalLight
            intensity={1.6}
            castShadow
            position={[-15, 18, 15]}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.00005}
          >
            <OrthographicCamera
              left={-22}
              right={15}
              top={40}
              bottom={-20}
              ref={shadowCameraRef}
              attach="shadow-camera"
            />
          </directionalLight>
          <ambientLight intensity={0.75} color="#d8efff" />

          <Suspense fallback={<PercentageProgress />}>
            <Physics gravity={[0, GRAVITY, 0]} colliders="trimesh" debug={debugColliders}>
              <scene ref={refScene}>
                <Ocean level={worldSettings?.oceanLevel} />
                <PirateShip height={worldSettings?.shipHeight} scale={worldSettings?.shipScale} />
                {proceduralSettings && <ProceduralMarkers settings={proceduralSettings} />}
                <EngineSceneObjects
                  objects={sceneObjects}
                  selectedId={selectedSceneObjectId}
                  onSelect={onSelectSceneObject}
                  onUpdate={onUpdateSceneObject}
                  editorEnabled={editorMode && !isPlaying}
                  transformMode={transformMode}
                  snapEnabled={snapEnabled}
                />

                <mesh castShadow receiveShadow>
                  {torusPositions.map((position, i) => (
                    <RigidBody key={i} colliders="ball" mass={0.0001} position={[0, 10, 0]}>
                      <Torus
                        castShadow
                        args={[0.5, 0.1, 14, 14]}
                        position={[position.x, 1, position.z]}
                        rotation={[0, torusRotation, 0]}
                        onClick={handleTorusRotation}
                      >
                        <meshStandardMaterial />
                      </Torus>
                    </RigidBody>
                  ))}
                </mesh>

                {isPlaying ? (
                  <CameraFollower refScene={refScene} />
                ) : (
                  <EditorCamera
                    selectedObject={sceneObjects.find(({ id }) => id === selectedSceneObjectId)}
                  />
                )}

                {!isMobile && !editorMode && <Perf position="bottom-left" />}

                <CharacterController
                  refScene={refScene}
                  gamepad={gamepad}
                  enabled={isPlaying}
                  onAttack={handleAttack}
                />

                {impactBursts.map((burst) => (
                  <ImpactBurst
                    key={burst.id}
                    position={burst.position}
                    onComplete={() =>
                      setImpactBursts((bursts) => bursts.filter(({ id }) => id !== burst.id))
                    }
                  />
                ))}

                <Rotator>
                  <Box position={[15, -10, 5]}>
                    <meshStandardMaterial color="magenta" roughness={0.01} metalness={0.5} />
                  </Box>
                  <TorusKnot position={[-15, -10, 2]}>
                    <meshStandardMaterial
                      color="black"
                      roughness={0.01}
                      metalness={0.5}
                      wireframe
                    />
                  </TorusKnot>
                </Rotator>

                {isPlaying && <Projectiles refScene={refScene} />}

                <RigidBody type="fixed" colliders="cuboid" position={[0, -10, 0]}>
                  <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[20, 0, 20]} />
                    <meshStandardMaterial color="red" transparent opacity={0.1} />
                  </mesh>
                </RigidBody>

                <RigidBody type="fixed" colliders="cuboid" position={[-20, -20, 0]}>
                  <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[20, 0, 20]} />
                    <meshStandardMaterial color="blue" transparent opacity={0.1} />
                  </mesh>
                </RigidBody>
              </scene>
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </FullscreenWrapper>
  )
}
