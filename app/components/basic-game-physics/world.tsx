import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'

import { Torus } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
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
        <Ground active={true} />
        <directionalLight
          position={[0, 10, 0]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={<Progress />}>
          <Physics debug={true} gravity={[0, -9.81, 0]}>
            <scene ref={refScene}>
              <RigidBody colliders={'cuboid'} type={'fixed'} restitution={2} position={[0, 0, 0]}>
                <Torus args={[0.1, 0.4, 16, 64]} position={[5, 0.1, 0]} />
              </RigidBody>
              {/* <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport />
              </GizmoHelper> */}
              <CameraFollower />
              {/* <ambientLight /> */}

              {/* <spotLight name="spotlight" position={[0, 10, 0]} intensity={20}  /> */}
              <RigidBody colliders={'cuboid'} type={'fixed'} position={[0, 0.5, 0]}>
                <Player refScene={refScene} />
              </RigidBody>
              {/* <PointerLockControls camera={refCamera.current} /> */}
              {/* <fog attach="fog" args={[0x000000, 10, 100]} /> */}
              <RigidBody colliders={'cuboid'} type={'fixed'} restitution={0.5}>
                <mesh rotation={[-0.5 * Math.PI, 0, 0]} position={[0, 0, 0]}>
                  <mesh position={[0, 20, 5]}>
                    <boxGeometry args={[40, 1, 10]} />
                    <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                  </mesh>
                  <mesh position={[0, -20, 5]}>
                    <boxGeometry args={[40, 1, 10]} />
                    <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                  </mesh>
                  <mesh position={[20, 0, 5]}>
                    <boxGeometry args={[0, -40, 10]} />
                    <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                  </mesh>
                  <mesh position={[-20, 0, 5]}>
                    <boxGeometry args={[0, -40, 10]} />
                    <meshStandardMaterial color="transparent" transparent opacity={0.1} />
                  </mesh>
                  <planeGeometry args={[40, 40]} />
                  <meshStandardMaterial color="white" />
                </mesh>
              </RigidBody>
              {/* <DungeonScene active={false} /> */}
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
