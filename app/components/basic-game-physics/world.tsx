import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Suspense, useEffect, useRef, useState } from 'react'

import { Torus } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import CameraFollower from './camera'
import FullscreenWrapper from './fullscreen'
import Ground from './ground'
import Player from './player'
import Progress from './progress'
import GameInterface from './ui/interface'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const playerRef = useRef<THREE.Object3D>(null!)

  const handleTorusRotation = () => {
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
                <Torus
                  castShadow
                  args={[4.1, 0.4, 16, 64]}
                  position={[-5, 4, -5]}
                  rotation={[0, torusRotation, 0]}
                  onClick={handleTorusRotation}
                />
              </mesh>
              <CameraFollower playerRef={playerRef} />
              <Ground active={true} receiveShadow />
              <directionalLight
                position={[10, 10, 10]}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                intensity={11.5}
                castShadow
              />
              <Perf position="bottom-left" />
              <spotLight name="spotlight" position={[0, 10, 0]} intensity={20} />
              <Player ref={playerRef} refScene={refScene} />
              <mesh rotation={[-0.5 * Math.PI, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <mesh position={[0, 20, 5]} castShadow receiveShadow>
                  <boxGeometry args={[40, 1, 10]} />
                  <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                </mesh>
                <mesh position={[0, -20, 5]} castShadow receiveShadow>
                  <boxGeometry args={[40, 1, 10]} />
                  <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                </mesh>
                <mesh position={[20, 0, 5]} castShadow receiveShadow>
                  <boxGeometry args={[0, -40, 10]} />
                  <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                </mesh>
                <mesh position={[-20, 0, 5]} castShadow receiveShadow>
                  <boxGeometry args={[0, -40, 10]} />
                  <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                </mesh>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="white" />
              </mesh>
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
