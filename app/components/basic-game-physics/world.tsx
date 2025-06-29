import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'

import * as THREE from 'three'
import CameraHelper from './camera'
import Controls from './controls'
import FullscreenWrapper from './fullscreen'
import Ground from './ground'
import Player from './player'
import Progress from './progress'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)

  useEffect(() => {
    refCanvas.current.addEventListener('click', () => {
      refCanvas.current.requestPointerLock()
      refCanvas.current.requestFullscreen()
    })
    return () => {
      if (refCanvas.current) {
        refCanvas.current.removeEventListener('click', () => {
          refCanvas.current.requestPointerLock()
          refCanvas.current.requestFullscreen()
        })
      }
    }
  }, [])

  return (
    <FullscreenWrapper>
      <Canvas
        fallback={'Sorry no WebGL supported!'}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800"
        style={{
          height: '100vh',
        }}
        ref={refCanvas}
        camera={{
          fov: 60,
          near: 1,
          far: 1000,
          rotation: [-0.3, 0, 0],
          position: [0, 10, 10],
        }}
        // camera={refCamera.current}
      >
        <Suspense fallback={<Progress />}>
          <scene ref={refScene}>
            <Player refCamera={refCamera} refScene={refScene} />
            <ambientLight name="ambientLight" intensity={10} position={[0, 1000, 0]} />
            <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} />
            <Controls />
            <CameraHelper refCamera={refCamera} />
            <Ground active={true} />
            {/* <fog attach="fog" args={[0x000000, 10, 100]} /> */}
            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial
                color="#2a2a2a"
                wireframe={false}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh> */}
            {/* <DungeonScene active={false} /> */}
          </scene>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
