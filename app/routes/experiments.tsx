import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import type { Route } from './+types/home'

import { Suspense, useEffect, useState } from 'react'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Experiments' }, { name: 'description', content: 'Experiments' }]
}

const Scene = () => {
  const materials = useLoader(MTLLoader, '/models/misc/steering/material.mtl')
  const obj = useLoader(OBJLoader, '/models/misc/steering/steering.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  return <primitive object={obj} />
}

function IncrementalLoader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50) // Increment every 50ms for smooth animation

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-96 w-full rounded-lg flex flex-col items-center justify-center">
      <div className="text-gray-800 dark:text-white text-2xl font-bold mb-4">
        Loading 3D Model...
      </div>
      <div className="w-64 bg-gray-700 rounded-full h-3 mb-2">
        <div
          style={{ width: `${progress}%` }}
          className="h-3 rounded-full bg-gradient-to-r from-pink-600 to-amber-300 transition-all duration-100"
        ></div>
      </div>
      <div className="text-gray-800 dark:text-white text-lg">{progress}%</div>
    </div>
  )
}

export default function About() {
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
            <p className="w-80 absolute top-4 left-4 z-10 text-white leading-relaxed mb-4">
              This is a 3D model of a racing steering wheel. Drag with the mouse to look around.
            </p>
            <Canvas
              fallback={
                <div className="bg-gray-100 dark:bg-gray-800 h-96 w-full rounded-lg flex items-center justify-center">
                  Sorry no WebGL supported!
                </div>
              }
              camera={{ position: [0, 0, 10], fov: 100 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 h-96 w-full rounded-lg"
            >
              <Environment preset="sunset" />
              <ambientLight intensity={0.6} />
              <pointLight position={[0, 1, 1]} intensity={5} />
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                zoomSpeed={0.5}
                panSpeed={0.5}
                rotateSpeed={0.5}
              />
              <Suspense fallback={<IncrementalLoader />}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
