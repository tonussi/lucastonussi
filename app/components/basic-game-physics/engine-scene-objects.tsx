import { TransformControls } from '@react-three/drei'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { clampTreeSettings, TRUNK_RADIUS_RATIO } from '../game-engine/tree-generator'
import type { EngineSceneObject } from '../game-engine/types'
import TreeMesh from './tree-mesh'

const HALF_HEIGHT_RATIO = 0.5

interface EngineSceneObjectsProps {
  objects: EngineSceneObject[]
  selectedId?: string
  editorEnabled: boolean
  transformMode: 'translate' | 'rotate' | 'scale'
  snapEnabled: boolean
  onSelect?: (id: string) => void
  onUpdate?: (id: string, patch: Partial<EngineSceneObject>) => void
}

function ObjectMesh({ object, selected, onSelect }: {
  object: EngineSceneObject
  selected: boolean
  onSelect?: (id: string) => void
}) {
  const handleClick = onSelect ? (event: { stopPropagation: () => void }) => {
    event.stopPropagation()
    onSelect(object.id)
  } : undefined

  if (object.kind === 'tree') {
    return <TreeMesh
      settings={clampTreeSettings(object.tree)}
      leafColor={object.color}
      selected={selected}
      onClick={handleClick}
    />
  }

  return (
    <mesh castShadow receiveShadow onClick={handleClick}>
      {object.kind === 'sphere' ? (
        <sphereGeometry args={[0.75, 24, 16]} />
      ) : (
        <boxGeometry args={[1.25, 1.25, 1.25]} />
      )}
      <meshStandardMaterial
        color={object.color}
        emissive={selected ? '#8a631e' : '#000000'}
        emissiveIntensity={selected ? 0.9 : 0}
        roughness={0.52}
        metalness={0.12}
      />
    </mesh>
  )
}

function EditableObject({ object, transformMode, snapEnabled, onSelect, onUpdate }: {
  object: EngineSceneObject
  transformMode: EngineSceneObjectsProps['transformMode']
  snapEnabled: boolean
  onSelect?: EngineSceneObjectsProps['onSelect']
  onUpdate?: EngineSceneObjectsProps['onUpdate']
}) {
  const group = useRef<THREE.Group>(null)
  const commitTransform = useCallback(() => {
    if (!group.current || !onUpdate) return
    const { position, rotation, scale } = group.current
    onUpdate(object.id, {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      scale: [scale.x, scale.y, scale.z],
    })
  }, [object.id, onUpdate])

  return (
    <TransformControls
      mode={transformMode}
      translationSnap={snapEnabled ? 0.25 : null}
      rotationSnap={snapEnabled ? THREE.MathUtils.degToRad(15) : null}
      scaleSnap={snapEnabled ? 0.1 : null}
      size={0.82}
      onObjectChange={commitTransform}
    >
      <group ref={group} position={object.position} rotation={object.rotation} scale={object.scale}>
        <ObjectMesh object={object} selected onSelect={onSelect} />
      </group>
    </TransformControls>
  )
}

export default function EngineSceneObjects({
  objects,
  selectedId,
  editorEnabled,
  transformMode,
  snapEnabled,
  onSelect,
  onUpdate,
}: EngineSceneObjectsProps) {
  return <group name="engine-scene-objects">
    {objects.map((object) => {
      if (!object.visible) return null
      if (editorEnabled && selectedId === object.id) {
        return <EditableObject
          key={object.id}
          object={object}
          transformMode={transformMode}
          snapEnabled={snapEnabled}
          onSelect={onSelect}
          onUpdate={onUpdate}
        />
      }
      if (object.kind === 'tree') {
        const { height } = clampTreeSettings(object.tree)
        return <RigidBody
          key={object.id}
          type="fixed"
          colliders={false}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
        >
          <CylinderCollider
            args={[height * HALF_HEIGHT_RATIO, height * TRUNK_RADIUS_RATIO]}
            position={[0, height * HALF_HEIGHT_RATIO, 0]}
          />
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled ? onSelect : undefined} />
        </RigidBody>
      }
      return <RigidBody
        key={object.id}
        type="fixed"
        colliders={object.kind === 'sphere' ? 'ball' : 'cuboid'}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
      >
        <ObjectMesh object={object} selected={false} onSelect={editorEnabled ? onSelect : undefined} />
      </RigidBody>
    })}
  </group>
}
