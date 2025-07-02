import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

import { Html, useProgress } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

import * as THREE from 'three'
import { Input } from '../ui/input'
extend(THREE as any)

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(2)} % loaded</Html>
}

const SteeringWheel = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!)

  const wheel = useLoader(OBJLoader, '/models/steering/shape.obj')

  // const material = useLoader(MTLLoader, '/models/steering/material.mtl')

  wheel.traverse((child: THREE.Object3D) => {
    child.castShadow = true
    child.receiveShadow = true
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.transparent = true
          mat.opacity = 0.1
          mat.wireframe = true
          mat.color.set('gray')
        })
      } else {
        child.material.transparent = true
        child.material.opacity = 0.1
        child.material.wireframe = true
        child.material.color.set('blue')
      }
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1]}>
      <primitive castShadow object={wheel} position={[0, -2, 0]} />
    </instancedMesh>
  )
}

export default function CarBuildShare() {
  const [searching, setSearching] = useState(false)
  const refCamera = useRef<THREE.PerspectiveCamera>(null!)
  const refCanvas = useRef<HTMLCanvasElement>(null!)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(e.target.value.length > 0)
  }

  // Add CSS animation for gradient pulse
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes gradientPulse {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.3; }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <div className="min-h-screen sm:max-w-screen px-10!">
      <div className="mb-30">
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Car Build Freak</h1>
          <p className="text-lg max-w-3xl">
            Discover, share, and collaborate on racing car builds with the community. Search through
            thousands of parts, tracks, and connect with fellow racing enthusiasts. Upload your
            custom builds, find inspiration, and get feedback from the community.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-400 sm:max-w">
            <span>🏁 Racing Community</span>
            <span>🔧 Parts Database</span>
            <span>🏎️ Build Setups</span>
            <span>💬 Community Feedback</span>
            <span>🏪 Stores and partners</span>
          </div>
        </div>
        <div className="relative mb-8 w-full">
          <div className="relative flex flex-row justify-center items-center">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Looking for carbon fiber steering wheel for a 2023 Porsche 911..."
                onChange={handleSearch}
                className="w-full px-6 py-4 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-full shadow-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow:
                    '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                }}
              />
              {/* Gradient pulse animation overlay */}
              <div
                className="absolute inset-0 rounded-full opacity-0 animate-pulse pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                  animation: 'gradientPulse 3s ease-in-out infinite',
                }}
              />

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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Card 1 - Steering Wheel Description */}
        <div className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2">
          {/* Clipped Figure Background */}
          <div className="relative h-32 md:h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-80"
              style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Decorative Elements */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 w-6 md:w-8 h-6 md:h-8 border-2 border-white/30 rounded-full" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-3 md:w-4 h-3 md:h-4 bg-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 border border-white/20 rounded-lg rotate-45" />
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Racing Steering Wheel
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-sm leading-relaxed mb-4">
              This high-performance racing steering wheel is engineered for precision control and
              maximum feedback. Crafted from premium materials including carbon fiber and aluminum,
              it provides the perfect balance of weight and durability for competitive racing
              environments.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-sm leading-relaxed">
              Features include ergonomic grip design, customizable button layouts, and advanced
              force feedback systems that deliver real-time information about track conditions and
              vehicle dynamics.
            </p>
          </div>
        </div>

        {/* Card 2 - Racing Community */}
        <div className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2">
          {/* Clipped Figure Background */}
          <div className="relative h-32 md:h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Decorative Elements */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 w-6 md:w-8 h-6 md:h-8 border-2 border-white/30 rounded-full" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-3 md:w-4 h-3 md:h-4 bg-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 border border-white/20 rounded-lg rotate-45" />
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Racing Community
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-sm leading-relaxed mb-4">
              Join our racing community to connect with other enthusiasts, share your racing
              experiences, and stay updated on the latest racing news and events.
            </p>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-8 md:w-12 h-8 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm mb-1 md:mb-2">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-300 text-xs text-center">
                    Racer {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3 - Performance Statistics */}
        <div className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2">
          {/* Clipped Figure Background */}
          <div className="relative h-32 md:h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-80"
              style={{ clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 15% 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Decorative Elements */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 w-6 md:w-8 h-6 md:h-8 border-2 border-white/30 rounded-full" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-3 md:w-4 h-3 md:h-4 bg-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 border border-white/20 rounded-lg rotate-45" />
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Performance Statistics
            </h3>
            <div className="space-y-3 md:space-y-4 text-gray-800 dark:text-white">
              {(() => {
                const durability = Math.floor(Math.random() * 101)
                return (
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Durability</span>
                      <span>{durability}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        style={{ width: `${durability}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-amber-300"
                      ></div>
                    </div>
                  </div>
                )
              })()}

              {(() => {
                const precision = Math.floor(Math.random() * 101)
                return (
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Precision</span>
                      <span>{precision}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        style={{ width: `${precision}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-amber-300"
                      ></div>
                    </div>
                  </div>
                )
              })()}

              {(() => {
                const responseTime = Math.floor(Math.random() * 101)
                return (
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Response Time</span>
                      <span>{responseTime}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        style={{ width: `${responseTime}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-amber-300"
                      ></div>
                    </div>
                  </div>
                )
              })()}

              {(() => {
                const weightDistribution = Math.floor(Math.random() * 101)
                return (
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Weight Distribution</span>
                      <span>{weightDistribution}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        style={{ width: `${weightDistribution}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-amber-300"
                      ></div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Card 4 - 3D Model */}
        <div className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2">
          {/* Clipped Figure Background */}
          <div className="relative h-32 md:h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-80"
              style={{ clipPath: 'polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Decorative Elements */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 w-6 md:w-8 h-6 md:h-8 border-2 border-white/30 rounded-full" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-3 md:w-4 h-3 md:h-4 bg-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 border border-white/20 rounded-lg rotate-45" />
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              3D Steering Wheel Model
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-sm leading-relaxed mb-4">
              Interactive 3D model of a racing steering wheel. Drag with the mouse to look around
              and explore the detailed design.
            </p>

            {/* 3D Canvas Container */}
            <div className="relative h-48 md:h-64 w-full rounded-lg overflow-hidden">
              <Canvas
                ref={refCanvas}
                fallback={
                  <div className="bg-gray-100 dark:bg-gray-800 h-full text-xs w-full rounded-lg flex items-center justify-center">
                    Sorry no WebGL supported!
                  </div>
                }
                shadows
                className="bg-gradient-to-br from-gray-200 via-gray-2800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 h-full w-full rounded-lg"
              >
                <Suspense fallback={<Loader />}>
                  <PerspectiveCamera ref={refCamera} position={[0, 5, 8]} />
                  <ambientLight intensity={0.1} position={[0, 2000, 1000]} />
                  <spotLight
                    position={[55, 5, 20]}
                    angle={0.15}
                    penumbra={0.8}
                    decay={0}
                    intensity={Math.PI}
                  />
                  <mesh position={[0, -2.5, 0]} receiveShadow>
                    <boxGeometry args={[2, 0.2, 2]} />
                    <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.8} />
                  </mesh>
                  <mesh position={[0, -3, 0]} receiveShadow>
                    <boxGeometry args={[3, 0.8, 3]} />
                    <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.6} />
                  </mesh>
                  <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={0.5}
                    panSpeed={0.5}
                    rotateSpeed={0.5}
                    makeDefault
                    autoRotate
                    autoRotateSpeed={5.4}
                    mouseButtons={{
                      MIDDLE: THREE.MOUSE.PAN,
                      RIGHT: THREE.MOUSE.ROTATE,
                    }}
                  />
                  <SteeringWheel />
                </Suspense>
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
