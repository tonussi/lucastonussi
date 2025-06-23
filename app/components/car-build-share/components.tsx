import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

import { extend, type ThreeElement } from '@react-three/fiber'
import { Suspense } from 'react'
import { GridHelper } from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
class CustomGrid extends GridHelper {}
extend({ CustomGrid })

import * as THREE from 'three'
declare module '@react-three/fiber' {
  interface ThreeElements {
    customElement: ThreeElement<typeof CustomGrid>
  }
}
const color = new THREE.Color()
console.log(color)

const Scene = () => {
  const materials = useLoader(MTLLoader, '/models/misc/steering/material.mtl')
  const obj = useLoader(OBJLoader, '/models/misc/steering/steering.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  return <primitive object={obj} />
}

function IncrementalLoader() {
  return <>Loading 3D Model...</>
}

export default function CarBuildShare() {
  return (
    <div className="min-h-screen text-white p-8 mb-10">
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Description and Content */}
          <div className="space-y-8">
            {/* Steering Wheel Description */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-gray-800 dark:text-white text-2xl font-bold mb-4">
                Racing Steering Wheel
              </h2>
              <p className="text-gray-800 dark:text-gray-300 leading-relaxed mb-4">
                This high-performance racing steering wheel is engineered for precision control and
                maximum feedback. Crafted from premium materials including carbon fiber and
                aluminum, it provides the perfect balance of weight and durability for competitive
                racing environments.
              </p>
              <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
                Features include ergonomic grip design, customizable button layouts, and advanced
                force feedback systems that deliver real-time information about track conditions and
                vehicle dynamics.
              </p>
            </div>

            {/* Avatar List */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-gray-800 dark:text-white text-xl font-semibold mb-4">
                Racing Community
              </h3>
              <p className="text-gray-800 dark:text-gray-300 leading-relaxed mb-4">
                Join our racing community to connect with other enthusiasts, share your racing
                experiences, and stay updated on the latest racing news and events.
              </p>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <span className="text-gray-800 dark:text-gray-300 text-xs text-center">
                      Racer {i}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Bars */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-gray-800 dark:text-white text-xl font-semibold mb-4">
                Performance Statistics
              </h3>
              <div className="space-y-4 text-gray-800 dark:text-white">
                {(() => {
                  const durability = Math.floor(Math.random() * 101)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Durability</span>
                        <span>{durability}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${durability}%` }}
                          className="h-2 w-3/4 rounded-full bg-linear-to-r from-pink-600 to-amber-300 ring-1 ring-gray-950/10 ring-inset dark:from-pink-500 dark:to-amber-200 dark:ring-white/10"
                        ></div>
                      </div>
                    </div>
                  )
                })()}

                {(() => {
                  const precision = Math.floor(Math.random() * 101)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Precision</span>
                        <span>{precision}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${precision}%` }}
                          className="h-2 w-3/4 rounded-full bg-linear-to-r from-pink-600 to-amber-300 ring-1 ring-gray-950/10 ring-inset dark:from-pink-500 dark:to-amber-200 dark:ring-white/10"
                        ></div>
                      </div>
                    </div>
                  )
                })()}

                {(() => {
                  const responseTime = Math.floor(Math.random() * 101)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time</span>
                        <span>{responseTime}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${responseTime}%` }}
                          className="h-2 w-3/4 rounded-full bg-linear-to-r from-pink-600 to-amber-300 ring-1 ring-gray-950/10 ring-inset dark:from-pink-500 dark:to-amber-200 dark:ring-white/10"
                        ></div>
                      </div>
                    </div>
                  )
                })()}

                {(() => {
                  const weightDistribution = Math.floor(Math.random() * 101)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weight Distribution</span>
                        <span>{weightDistribution}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          style={{ width: `${weightDistribution}%` }}
                          className="h-2 w-3/4 rounded-full bg-linear-to-r from-pink-600 to-amber-300 ring-1 ring-gray-950/10 ring-inset dark:from-pink-500 dark:to-amber-200 dark:ring-white/10"
                        ></div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Right Column - 3D Model */}
          <div className="relative">
            <p className="w-50 absolute top-4 left-4 z-10 text-white leading-relaxed mb-4 text-xs">
              This is a 3D model of a racing steering wheel. Drag with the mouse to look around.
            </p>
            <Canvas
              dpr={[1, 2]}
              fallback={
                <div className="bg-gray-100 dark:bg-gray-800 h-96 text-xs w-full rounded-lg flex items-center justify-center">
                  Sorry no WebGL supported!
                </div>
              }
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 h-96 xs:h-full w-full rounded-lg"
            >
              <Suspense fallback={null}>
                <PerspectiveCamera
                  makeDefault
                  position={[10, 10, 12]}
                  near={0.1}
                  far={1000}
                  zoom={1}
                />
                <ambientLight intensity={Math.PI / 2} />
                <spotLight
                  position={[10, 10, 20]}
                  angle={0.15}
                  penumbra={0.8}
                  decay={0}
                  intensity={Math.PI}
                />
                {/* <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
                <OrbitControls
                  enableZoom={true}
                  enablePan={true}
                  enableRotate={true}
                  zoomSpeed={0.5}
                  panSpeed={0.5}
                  rotateSpeed={0.5}
                />
                <Scene />
                <mesh>
                  <customGrid args={[10, 10, 0x444444, 0x888888]} />
                </mesh>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
