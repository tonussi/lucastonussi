import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

import { OrbitControls, Torus } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import * as THREE from 'three'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const [torusPositions, setTorusPositions] = useState<{ x: number; z: number }[]>([])
  const { color } = useControls('Fog', { color: '#000' })

  useEffect(() => {
    const positions = Array.from({ length: 10 }, () => ({
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
      z: Math.random() * 20 - 10,
    }))
    setTorusPositions(positions)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTorusRotation(torusRotation + 0.01)
    }, 10)
    return () => clearInterval(interval)
  }, [torusRotation])

  return (
    <>
      <div className="top-0 -z-10 h-full w-full bg-white">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]"></div>
      </div>
      <Canvas
        fallback={'Sorry no WebGL supported!'}
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'transparent',
        }}
        ref={refCanvas}
        camera={{ position: [1, 2, 9], fov: 85, near: 0.25, far: 100 }}
        shadows
      >
        <Suspense fallback={null}>
          <Physics>
            <scene ref={refScene}>
              <ambientLight intensity={0.1} />
              <directionalLight color="red" position={[0, 0, 5]} />
              {torusPositions.map((position, i) => (
                <group key={i}>
                  <mesh castShadow receiveShadow>
                    <group>
                      <Torus
                        castShadow
                        args={[0.5, 0.09, 64, 64]}
                        position={[position.x, 1.1, position.z]}
                        rotation={[0, torusRotation * (i % 2 === 0 ? 1 : -1), 0]}
                      >
                        <meshStandardMaterial />
                      </Torus>
                      {/* Add tiny segments */}
                      {Array.from({ length: 12 }, (_, j) => (
                        <mesh
                          key={j}
                          castShadow
                          position={[
                            position.x + Math.random() * 0.2 - 0.1,
                            1 + Math.random() * 0.2 - 0.1,
                            position.z + Math.random() * 0.2 - 0.1,
                          ]}
                          rotation={[
                            Math.random() * Math.PI * 2,
                            torusRotation * 2,
                            Math.random() * Math.PI * 2,
                          ]}
                        >
                          <sphereGeometry args={[0.05, 32, 32]} />
                          <meshStandardMaterial
                            color={`hsl(${(j * 30 + i * 10) % 360}, 100%, 50%)`}
                            roughness={0.5}
                            metalness={0.5}
                          />
                        </mesh>
                      ))}
                    </group>
                  </mesh>
                  <mesh castShadow receiveShadow>
                    <Torus
                      castShadow
                      args={[0.4, 0.09, 64, 64]}
                      position={[position.x, 1.1, position.z]} // Slightly offset vertically
                      rotation={[0, torusRotation * (i % 2 === 0 ? -1 : 1), 0]} // Opposite rotation
                    >
                      <meshStandardMaterial />
                    </Torus>
                  </mesh>
                </group>
              ))}
              <fog attach="fog" args={[color, 2, 10]} />
              <directionalLight
                position={[10, 10, 10]}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                intensity={11.5}
              />
              <OrbitControls autoRotate />
              <spotLight name="spotlight" position={[0, 10, 0]} intensity={20} />
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </>
  )
}
