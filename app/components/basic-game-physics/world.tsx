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
        ref={refCanvas}
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
            <group rotation={[0, Math.PI / 2, 0]}>
              <lineSegments
                args={[
                  new THREE.BufferGeometry(),
                  new THREE.LineBasicMaterial({ color: 0x00ff00 }),
                ]}
              ></lineSegments>
            </group>
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
