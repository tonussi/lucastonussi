import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

import { Box, KeyboardControls, OrthographicCamera, Torus, TorusKnot } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import CameraFollower from './camera'
import { CharacterController } from './character-controller'
import { GRAVITY } from './constants'
import FullscreenWrapper from './fullscreen'
import Projectiles from './projectiles'
import Rotator from './rotator'
import SphereOfPointsWithPhysics from './sphere'
import GameInterface from './ui/interface'
extend(THREE as any)

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['Shift'] },
]

export default function BasicGamePhysics() {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const [torusPositions, setTorusPositions] = useState<{ x: number; z: number }[]>([])
  const playerRef = useRef<THREE.Object3D>(null!)
  const camera = refScene.current?.getObjectByName('camera') as THREE.PerspectiveCamera

  // Initialize torus positions on mount
  useEffect(() => {
    const positions = Array.from({ length: 10 }, () => ({
      x: Math.random() * 20 - 10,
      z: Math.random() * 20 - 10,
    }))
    setTorusPositions(positions)
  }, [])

  const handleTorusRotation = (index: number) => {
    setTorusRotation(torusRotation + 0.01)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTorusRotation(torusRotation + 0.01)
    }, 10)
    return () => clearInterval(interval)
  }, [torusRotation])

  useEffect(() => {
    refCanvas.current.addEventListener('click', () => {
      // refCanvas.current.requestFullscreen()
    })
    return () => {
      if (refCanvas.current) {
        refCanvas.current.removeEventListener('click', () => {
          // refCanvas.current.requestFullscreen()
        })
      }
    }
  }, [])

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const shadowCameraRef = useRef<THREE.OrthographicCamera>(null!)

  return (
    <FullscreenWrapper>
      {isMobile && <GameInterface />}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          fallback={'Sorry no WebGL supported!'}
          style={{
            height: '100vh',
          }}
          ref={refCanvas}
          shadows
        >
          <color attach="background" args={['#ececec']} />
          <directionalLight
            intensity={0.65}
            castShadow
            position={[-15, 10, 15]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.00005}
          >
            <OrthographicCamera
              left={-22}
              right={15}
              top={40}
              bottom={-20}
              ref={shadowCameraRef}
              attach={'shadow-camera'}
            />
          </directionalLight>
          <Suspense fallback={null}>
            <Physics debug gravity={[0, GRAVITY, 0]} colliders="trimesh">
              <scene ref={refScene}>
                <mesh castShadow receiveShadow>
                  {torusPositions.map((position, i) => (
                    <RigidBody colliders="ball" mass={0.0001} position={[0, 10, 0]}>
                      <Torus
                        key={i}
                        castShadow
                        args={[0.5, 0.1, 14, 14]}
                        position={[position.x, 1, position.z]}
                        rotation={[0, torusRotation, 0]}
                        onClick={() => handleTorusRotation(i)}
                      >
                        <meshStandardMaterial />
                      </Torus>
                    </RigidBody>
                  ))}
                </mesh>

                <CameraFollower refScene={refScene} />

                <Perf position="bottom-left" />

                <CharacterController refScene={refScene} />

                <SphereOfPointsWithPhysics />

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

                <Projectiles refScene={refScene} />

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
