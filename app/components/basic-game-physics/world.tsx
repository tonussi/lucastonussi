import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'

import { useHelper } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useControls } from 'leva'
import * as THREE from 'three'
import { DirectionalLightHelper, SpotLightHelper } from 'three'
import CameraFollower from './camera'
import FullscreenWrapper from './fullscreen'
import Ground from './ground'
import Player from './player'
import Progress from './progress'
import GameInterface from './ui/interface'
extend(THREE as any)

function LightWithHelper() {
  const light = useRef<THREE.SpotLight>(null!)

  const { angle, penumbra, intensity } = useControls({
    angle: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },

    penumbra: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },

    intensity: {
      value: 80,
      min: 0,
      max: 100,
      step: 1,
    },
  })

  useHelper(light, SpotLightHelper, 'teal')

  return (
    <spotLight
      ref={light}
      angle={angle}
      penumbra={penumbra}
      intensity={intensity}
      position={[2, 500, 1]}
      castShadow
    />
  )
}

function DLightWithHelper() {
  const light = useRef<THREE.DirectionalLight>(null!)
  useHelper(light, DirectionalLightHelper, 2, 'crimson')

  const shadow = useRef<THREE.OrthographicCamera>(null!)

  useHelper(shadow, THREE.CameraHelper)

  return (
    <directionalLight ref={light} position={[-5, 500, 1]} castShadow>
      <orthographicCamera attach="shadow-camera" ref={shadow} top={8} right={8} />
    </directionalLight>
  )
}

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
        shadows
      >
        <Suspense fallback={<Progress />}>
          <Physics>
            <scene ref={refScene}>
              {/* <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport />
              </GizmoHelper> */}
              <CameraFollower />
              <ambientLight />
              <directionalLight
                position={[-5, 5, 5]}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              {/* <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} /> */}
              {/* <RigidBody position={[0, 0.5, 0]} colliders="cuboid" type="fixed"> */}
              <Player refScene={refScene} />
              {/* </RigidBody> */}
              {/* <PointerLockControls camera={refCamera.current} /> */}
              {/* <fog attach="fog" args={[0x000000, 10, 100]} /> */}
              <RigidBody colliders="cuboid" type="fixed">
                <mesh receiveShadow rotation={[-0.5 * Math.PI, 0, 0]} position={[0, 0, 0]}>
                  <planeGeometry args={[40, 40]} />
                  <shadowMaterial transparent opacity={0.2} />
                  <meshStandardMaterial color="gray" />
                </mesh>
              </RigidBody>
              <Ground active={true} />
              {/* <DungeonScene active={false} /> */}
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
