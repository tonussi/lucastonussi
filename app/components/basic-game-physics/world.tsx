import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'

import { ContactShadows } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import CameraHelper from './camera'
import Controls from './controls'
import FullscreenWrapper from './fullscreen'
import Ground from './ground'
import Player from './player'
import Progress from './progress'
import GameInterface from './ui/interface'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)

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

  const smallScreenOnly = () => {
    return window.innerWidth < 768
  }

  return (
    <FullscreenWrapper>
      {smallScreenOnly() && <GameInterface />}
      <Canvas
        fallback={'Sorry no WebGL supported!'}
        style={{
          height: '100vh',
          backgroundColor: 'white',
        }}
        ref={refCanvas}
        camera={refCamera.current}
        shadows
      >
        <Suspense fallback={<Progress />}>
          <Physics>
            <scene ref={refScene}>
              {/* <ambientLight name="ambientLight" intensity={10} position={[0, 1000, 0]} /> */}
              <ambientLight />
              <directionalLight
                position={[-5, 5, 5]}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              {/* <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} /> */}
              <Controls />
              <CameraHelper refCamera={refCamera} refScene={refScene} />
              <Player refCamera={refCamera} refScene={refScene} />
              {/* <PointerLockControls camera={refCamera.current} /> */}
              {/* <fog attach="fog" args={[0x000000, 10, 100]} /> */}
              <RigidBody colliders="cuboid" type="fixed">
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                  <planeGeometry args={[40, 40]} />
                  <shadowMaterial transparent opacity={0.2} />
                  <meshStandardMaterial color="white" />
                </mesh>
              </RigidBody>
              <ContactShadows
                frames={10}
                position={[0, -2, -0.16]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={0.8}
                opacity={0.1}
                blur={0.5}
                color="black"
              />
              <ambientLight intensity={5} />
              <Ground active={true} />
              <directionalLight
                position={[2, 30, -0.16]}
                intensity={0.5}
                castShadow
                shadow-mapSize-width={100}
                shadow-mapSize-height={100}
              />
              <ambientLight intensity={0.5} />
              {/* <DungeonScene active={false} /> */}
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
