import { OrbitControls, PerspectiveCamera, Progress } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

import { extend, type ThreeElement } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { GridHelper } from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
class CustomGrid extends GridHelper {}
extend({ CustomGrid })

import * as THREE from 'three'
import { Input } from '../ui/input'
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

export default function CarBuildShare() {
  const [searching, setSearching] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(e.target.value.length > 0)
  }

  return (
    <div className="min-h-screen p-8 mb-10">
      <div className="mb-30">
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Car Build Freak</h1>
          <p className="text-lg max-w-3xl">
            Discover, share, and collaborate on racing car builds with the community. Search through
            thousands of parts, tracks, and connect with fellow racing enthusiasts. Upload your
            custom builds, find inspiration, and get feedback from the community.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span>🏁 Racing Community</span>
            <span>🔧 Parts Database</span>
            <span>🏎️ Build Setups</span>
            <span>💬 Community Feedback</span>
            <span>🏪 Stores and partners</span>
          </div>
        </div>
        <div className="relative mb-8">
          <div className="relative flex flex-row justify-center items-center">
            <Input
              type="text"
              placeholder="Looking for carbon fiber steering wheel for a 2023 Porsche 911..."
              onChange={handleSearch}
              className="w-1/2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Auto-complete dropdown */}
          {searching && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Recent searches
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Carbon fiber steering wheel</span>
                  </div>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Monaco Grand Prix track</span>
                  </div>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Racing gloves</span>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Popular searches
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-blue-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Formula 1 steering wheels</span>
                  </div>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-blue-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Racing simulators</span>
                  </div>
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-blue-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Professional racing gear</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              <Suspense fallback={<Progress />}>
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
                  <gridHelper args={[50, 50, 0x424242, 0x888888]} />
                </mesh>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
