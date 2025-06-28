import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useRef } from 'react'

import * as THREE from 'three'
import CameraHelper from './camera'
import Controls from './controls'
import FullscreenWrapper from './fullscreen'
import Ground from './ground'
import Loader from './loader'
import Player from './player'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)

  return (
    <FullscreenWrapper>
      <Canvas
        fallback={'Sorry no WebGL supported!'}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800"
        style={{
          height: '100vh',
        }}
        // camera={{
        //   fov: 60,
        //   near: 1,
        //   far: 1000,
        //   rotation: [-0.3, 0, 0],
        //   position: [0, 10, 10],
        // }}
        camera={refCamera.current}
      >
        <Suspense fallback={<Loader />}>
          <scene ref={refScene}>
            <Player refCamera={refCamera} refScene={refScene} />
            <ambientLight name="ambientLight" intensity={10} position={[0, 1000, 0]} />
            <spotLight name="spotlight" position={[0, 10, 0]} intensity={100} />
            <Controls />
            <CameraHelper refCamera={refCamera} />
            <Ground active={true} />
            {/* <DungeonScene active={false} /> */}
          </scene>
        </Suspense>
      </Canvas>
    </FullscreenWrapper>
  )
}
