import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { LightSettings } from '../game-engine/types'

const MARKER_RADIUS = 0.25
const MARKER_SEGMENTS = 12
const SPOT_PENUMBRA = 0.3
const SPOT_DECAY = 2
const SUN_SHADOW_MAP_SIZE = 1024
const SUN_SHADOW_EXTENT = 30
const SUN_SHADOW_BIAS = -0.00005
const SPOT_TARGET_OFFSET: [number, number, number] = [0, -1, 0]

interface LightObjectProps {
  settings: LightSettings
  color: string
  selected: boolean
  showMarker: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function LightObject({ settings, color, selected, showMarker, onClick }: LightObjectProps) {
  const spot = useRef<THREE.SpotLight>(null)
  const target = useRef<THREE.Object3D>(null)
  const orbit = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    if (spot.current && target.current) spot.current.target = target.current
  }, [settings.lightType])

  useFrame(({ clock }) => {
    const group = orbit.current
    if (!group) return
    const { orbitRadius, orbitSpeed } = settings
    if (orbitRadius === 0) {
      if (group.position.lengthSq() !== 0) group.position.set(0, 0, 0)
      return
    }
    const angle = THREE.MathUtils.degToRad(orbitSpeed) * clock.elapsedTime
    group.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius)
  })

  return (
    <group>
      <group ref={orbit}>
      {settings.lightType === 'ambient' && <ambientLight color={color} intensity={settings.intensity} />}
      {settings.lightType === 'directional' && (
        <directionalLight
          color={color}
          intensity={settings.intensity}
          castShadow
          shadow-mapSize-width={SUN_SHADOW_MAP_SIZE}
          shadow-mapSize-height={SUN_SHADOW_MAP_SIZE}
          shadow-bias={SUN_SHADOW_BIAS}
          shadow-camera-left={-SUN_SHADOW_EXTENT}
          shadow-camera-right={SUN_SHADOW_EXTENT}
          shadow-camera-top={SUN_SHADOW_EXTENT}
          shadow-camera-bottom={-SUN_SHADOW_EXTENT}
        />
      )}
      {settings.lightType === 'spot' && (
        <>
          <spotLight
            ref={spot}
            color={color}
            intensity={settings.intensity}
            distance={settings.distance}
            angle={THREE.MathUtils.degToRad(settings.angle)}
            penumbra={SPOT_PENUMBRA}
            decay={SPOT_DECAY}
          />
          <object3D ref={target} position={SPOT_TARGET_OFFSET} />
        </>
      )}
      {settings.lightType === 'point' && (
        <pointLight
          color={color}
          intensity={settings.intensity}
          distance={settings.distance}
          decay={SPOT_DECAY}
        />
      )}
      </group>
      {showMarker && (
        <mesh onClick={onClick}>
          <sphereGeometry args={[MARKER_RADIUS, MARKER_SEGMENTS, MARKER_SEGMENTS]} />
          <meshBasicMaterial color={selected ? '#ffffff' : color} wireframe={!selected} />
        </mesh>
      )}
    </group>
  )
}
