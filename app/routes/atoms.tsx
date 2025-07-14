import { Canvas } from '@react-three/fiber'
import type { Route } from './+types/home'

import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

import Background from '@/components/background'
import { OrbitControls, Torus, TorusKnot } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import * as THREE from 'three'
extend(THREE as any)

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Atoms' }, { name: 'description', content: 'Atoms' }]
}

export default function Atoms() {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [torusRotation, setTorusRotation] = useState(0)
  const [torusPositions, setTorusPositions] = useState<{ x: number; z: number }[]>([])

  const { color } = useControls('Mesh Color', { color: '#a1a2c7' })
  const { motherColor } = useControls('Mother Color', { motherColor: '#000' })
  const { emissive } = useControls('Emissive', { emissive: '#000' })

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 2

  // Calculate random points on TorusKnot surface for both ends
  const [linePoints, setLinePoints] = useState(() => {
    const points = []
    for (let i = 0; i < 16; i++) {
      // Calculate start point
      const u1 = Math.random() * Math.PI * 2
      const v1 = Math.random() * Math.PI * 2
      const start = new THREE.Vector3(
        (1 + 0.2 * Math.cos(3 * v1)) * Math.cos(2 * u1),
        (1 + 0.2 * Math.cos(3 * v1)) * Math.sin(2 * u1),
        0.2 * Math.sin(3 * v1)
      )

      // Calculate end point (offset by rotation)
      const u2 = (u1 + Math.PI) % (Math.PI * 2)
      const v2 = (v1 + Math.PI) % (Math.PI * 2)
      const end = new THREE.Vector3(
        (1 + 0.2 * Math.cos(3 * v2)) * Math.cos(2 * u2),
        (1 + 0.2 * Math.cos(3 * v2)) * Math.sin(2 * u2),
        0.2 * Math.sin(3 * v2)
      )

      points.push({ start, end })
    }
    return points
  })

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

  const hexToRgba = (hex: string) => {
    if (!hex) return 'rgba(173,109,244,0.5)'
    const [r, g, b] = hex.match(/\w{2}/g)!.map((x) => parseInt(x, 16))
    return `rgba(${r},${g},${b},0.5)`
  }

  return (
    <>
      <Background color={'rgba(235,167,112,0.5)'} color2={'rgba(108,151,233,0.5)'} />
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
            <ambientLight intensity={0.5} />
            <spotLight name="spotlight" position={[0, 10, 0]} intensity={20} />
            <directionalLight
              position={[10, 10, 10]}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              intensity={1.5}
            />
            <group>
              <mesh castShadow>
                <TorusKnot
                  args={[1, 0.4, 128, 64]}
                  position={[0, 1, 0]}
                  rotation={[0, torusRotation, 0]}
                >
                  <meshStandardMaterial
                    //#000 -> gradient -> #db1e1e
                    color={motherColor}
                    roughness={0.24}
                    metalness={0.5}
                    opacity={1}
                  />
                </TorusKnot>
              </mesh>
              <mesh>
                {/* Multiple lines radiating from the torus knot */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <lineSegments
                    rotation={[0, torusRotation * 0.01, 0]}
                    key={i}
                    args={[
                      new THREE.BufferGeometry().setFromPoints([
                        linePoints[i].start, // Starting point on TorusKnot
                        linePoints[i].end, // Ending point on TorusKnot
                      ]),
                    ]}
                  >
                    <lineBasicMaterial
                      color={'white'}
                      opacity={0.1}
                      linewidth={5.12}
                      transparent={true}
                      depthTest={false}
                    />
                  </lineSegments>
                ))}
              </mesh>
            </group>
            {torusPositions.map((position, i) => (
              <group key={i}>
                <group>
                  <mesh castShadow>
                    <Torus
                      args={[0.5, 0.08, 64, 64]}
                      position={[position.x, 1.1, position.z]}
                      rotation={[0, torusRotation * (i % 2 === 0 ? 1 : -1), 0]}
                    >
                      <meshStandardMaterial
                        color={color}
                        roughness={0.5}
                        metalness={0.5}
                        opacity={0.5}
                        transparent
                      />
                    </Torus>
                    {/* Add tiny segments */}
                    {Array.from({ length: 12 }, (_, j) => (
                      <mesh
                        key={j}
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
                  </mesh>
                </group>
                <mesh castShadow>
                  <Torus
                    args={[0.4, 0.035, 8, 16]}
                    position={[position.x, 1.1, position.z]} // Slightly offset vertically
                    rotation={[0, torusRotation * (i % 2 === 0 ? -1 : 1), 0]} // Opposite rotation
                  >
                    <meshStandardMaterial color={color} emissive={emissive} />
                  </Torus>
                </mesh>
              </group>
            ))}
            <OrbitControls autoRotate />
          </Physics>
        </Suspense>
      </Canvas>
    </>
  )
}
