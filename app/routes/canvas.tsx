import { Canvas } from '@react-three/fiber'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

import { Torus } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
extend(THREE as any)

export default function BasicGamePhysics() {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const [torusPositions, setTorusPositions] = useState<{ x: number; z: number }[]>([])
  const torusRefs = useRef<THREE.Mesh[]>([])

  // Initialize torus positions on mount
  useEffect(() => {
    const positions = Array.from({ length: 10 }, () => ({
      x: Math.random() * 20 - 10,
      z: Math.random() * 20 - 10,
    }))
    setTorusPositions(positions)
  }, [])

  const handleTorusRotation = (index: number) => {
    console.log(index)
    setTorusRotation(torusRotation + 0.01)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTorusRotation(torusRotation + 0.01)
    }, 10)
    return () => clearInterval(interval)
  }, [torusRotation])

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
        camera={{ position: [1, 4, 10], fov: 75, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <Physics>
            <scene ref={refScene}>
              {torusPositions.map((position, i) => (
                <group key={i}>
                  <mesh castShadow receiveShadow>
                    <Torus
                      args={[0.5, 0.1, 64, 64]}
                      position={[position.x, 1, position.z]}
                      rotation={[0, torusRotation * (i % 2 === 0 ? 1 : -1), 0]}
                    />
                  </mesh>
                  <mesh castShadow receiveShadow>
                    <Torus
                      args={[0.5, 0.1, 64, 64]}
                      position={[position.x, 1.1, position.z]} // Slightly offset vertically
                      rotation={[0, torusRotation * (i % 2 === 0 ? -1 : 1), 0]} // Opposite rotation
                    />
                  </mesh>
                </group>
              ))}
              <directionalLight
                position={[10, 10, 10]}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                intensity={11.5}
                castShadow
              />
              <spotLight name="spotlight" position={[0, 10, 0]} intensity={20} />
            </scene>
          </Physics>
        </Suspense>
      </Canvas>
    </>
  )
}
