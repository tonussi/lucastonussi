import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Suspense, useEffect, useRef, useState } from 'react'

import { Box, Torus } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import CameraFollower from './camera'
import FullscreenWrapper from './fullscreen'
import Player from './player'
import Progress from './progress'
import ReflectiveSphere from './reflective-sphere'
import Rotator from './rotator'
import SphereOfPointsWithPhysics from './sphere'
import GameInterface from './ui/interface'
extend(THREE as any)

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
    console.log(index)
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

  return (
    <FullscreenWrapper>
      {isMobile && <GameInterface />}
      <Canvas
        fallback={'Sorry no WebGL supported!'}
        style={{
          height: '100vh',
          backgroundColor: 'white',
        }}
        ref={refCanvas}
        shadows
      >
        <Suspense fallback={<Progress />}>
          <Physics>
            <scene ref={refScene}>
              <mesh castShadow receiveShadow>
                {torusPositions.map((position, i) => (
                  <RigidBody colliders="cuboid" gravityScale={0} position={[0, 0, 0]}>
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
              <CameraFollower playerRef={playerRef} />
              {/* <Ground active={true} receiveShadow /> */}
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 10, 10]}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                intensity={11.5}
                castShadow
              />
              <Perf position="bottom-left" />
              <ReflectiveSphere />
              <spotLight name="spotlight" position={[0, 10, 0]} intensity={20} />
              <Player ref={playerRef} refScene={refScene} />
              <SphereOfPointsWithPhysics />
              <RigidBody colliders="cuboid" gravityScale={0} position={[0, 0, 0]}>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[40, 0, 10]} />
                  <meshStandardMaterial color="white" transparent opacity={0} />
                </mesh>
              </RigidBody>
              <Rotator>
                <Box position={[15, 5, 5]}>
                  <meshStandardMaterial color="red" />
                </Box>
                <Box position={[-15, 5, 2]}>
                  <meshStandardMaterial color="purple" />
                </Box>
              </Rotator>
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
