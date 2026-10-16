import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MODEL_CATALOG } from '../game-engine/model-catalog'

const SWAY_ROLL_AMPLITUDE = 0.025
const SWAY_ROLL_SPEED = 0.75
const SWAY_PITCH_AMPLITUDE = 0.015
const SWAY_PITCH_SPEED = 0.52

Object.values(MODEL_CATALOG).forEach(({ url }) => useGLTF.preload(url))

interface ModelObjectProps {
  modelId: string
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function ModelObject({ modelId, onClick }: ModelObjectProps) {
  const catalogModel = MODEL_CATALOG[modelId]
  if (!catalogModel) return null
  return <CatalogModelMesh modelId={modelId} onClick={onClick} />
}

function CatalogModelMesh({ modelId, onClick }: ModelObjectProps) {
  const { url, baseScale, baseOffset, baseYaw, sway } = MODEL_CATALOG[modelId]
  const { scene } = useGLTF(url)
  const model = useMemo(() => scene.clone(), [scene])
  const swayGroup = useRef<THREE.Group>(null)

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [model])

  useFrame(({ clock }) => {
    if (!sway || !swayGroup.current) return
    swayGroup.current.rotation.z = Math.sin(clock.elapsedTime * SWAY_ROLL_SPEED) * SWAY_ROLL_AMPLITUDE
    swayGroup.current.rotation.x = Math.sin(clock.elapsedTime * SWAY_PITCH_SPEED) * SWAY_PITCH_AMPLITUDE
  })

  return (
    <group ref={swayGroup} onClick={onClick}>
      <primitive object={model} position={baseOffset} rotation-y={baseYaw} scale={baseScale} />
    </group>
  )
}
