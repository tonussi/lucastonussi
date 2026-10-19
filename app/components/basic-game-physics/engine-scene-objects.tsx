import { TransformControls } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clampTreeSettings, TRUNK_RADIUS_RATIO } from '../game-engine/tree-generator'
import type { EngineSceneObject } from '../game-engine/types'
import { clampLightSettings } from '../game-engine/light-settings'
import { clampCaveSettings, generateCave } from '../game-engine/cave-generator'
import { clampGrassSettings } from '../game-engine/grass-generator'
import { buildHouse, clampHouseSettings } from '../game-engine/house-layout'
import { clampGrassPlaneSettings, generateGrassPlane } from '../game-engine/grass-plane-generator'
import { clampCharacterSettings } from '../game-engine/character-settings'
import { clampPickupSettings } from '../game-engine/pickup-settings'
import { clampPathSettings } from '../game-engine/path-generator'
import { clampWaterSettings } from '../game-engine/water-generator'
import { clampRockSettings } from '../game-engine/rock-generator'
import { clampOceanSettings } from '../game-engine/ocean-generator'
import { clampMountainSettings, generateMountain } from '../game-engine/mountain-generator'
import CaveMesh from './cave-mesh'
import MountainMesh from './mountain-mesh'
import PathMesh from './path-mesh'
import PickupMesh from './pickup-mesh'
import RockMesh from './rock-mesh'
import WaterMesh from './water-mesh'
import GrassMesh from './grass-mesh'
import GrassPlaneMesh from './grass-plane-mesh'
import HouseMesh from './house-mesh'
import LightObject from './light-object'
import ModelObject from './model-object'
import Ocean from './ocean'
import PlayerCharacter from './player-character'
import TreeMesh from './tree-mesh'
import { VegetationMask } from './vegetation-mask'

const HALF_HEIGHT_RATIO = 0.5
const GIZMO_RELEASE_SELECTION_GUARD_MS = 300
const NON_PHYSICAL_KINDS: EngineSceneObject['kind'][] = ['light', 'ocean', 'character', 'grass', 'path', 'water', 'pickup']

interface EngineSceneObjectsProps {
  objects: EngineSceneObject[]
  selectedId?: string
  editorEnabled: boolean
  transformMode: 'translate' | 'rotate' | 'scale'
  snapEnabled: boolean
  /** Objects hidden at runtime, such as pickups already collected. */
  hiddenIds?: string[]
  onSelect?: (id: string) => void
  onUpdate?: (id: string, patch: Partial<EngineSceneObject>) => void
}

function ObjectMesh({ object, selected, onSelect, editorEnabled }: {
  object: EngineSceneObject
  selected: boolean
  onSelect?: (id: string) => void
  editorEnabled: boolean
}) {
  const handleClick = onSelect ? (event: { stopPropagation: () => void }) => {
    event.stopPropagation()
    onSelect(object.id)
  } : undefined

  if (object.kind === 'ocean') return <Ocean settings={clampOceanSettings(object.ocean)} color={object.color} onClick={handleClick} />

  if (object.kind === 'character') return <PlayerCharacter settings={clampCharacterSettings(object.character)} state="idle" />

  if (object.kind === 'model' && object.model) {
    return <ModelObject modelId={object.model.modelId} onClick={handleClick} />
  }

  if (object.kind === 'grass') {
    return <GrassMesh settings={clampGrassSettings(object.grass)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'cave') {
    return <CaveMesh settings={clampCaveSettings(object.cave)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'grass-plane') {
    return <GrassPlaneMesh settings={clampGrassPlaneSettings(object.grassPlane)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'rock') {
    return <RockMesh settings={clampRockSettings(object.rock)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'pickup') {
    return <PickupMesh settings={clampPickupSettings(object.pickup)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'water') {
    return <WaterMesh settings={clampWaterSettings(object.water)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'path') {
    return <PathMesh settings={clampPathSettings(object.path)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'mountain') {
    return <MountainMesh settings={clampMountainSettings(object.mountain)} grass={object.grass} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'house') {
    return <HouseMesh settings={clampHouseSettings(object.house)} color={object.color} selected={selected} onClick={handleClick} />
  }

  if (object.kind === 'light') {
    return <LightObject
      settings={clampLightSettings(object.light)}
      color={object.color}
      selected={selected}
      showMarker={editorEnabled}
      onClick={handleClick}
    />
  }

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

type StructureCollider = {
  position: [number, number, number]
  halfExtents: [number, number, number]
}

function buildStructureColliders(object: EngineSceneObject): StructureCollider[] {
  if (object.kind === 'cave') return generateCave(clampCaveSettings(object.cave)).colliders
  return buildHouse(clampHouseSettings(object.house))
    .filter(({ solid }) => solid)
    .map(({ position, size }) => ({
      position,
      halfExtents: [size[0] / 2, size[1] / 2, size[2] / 2],
    }))
}

function StructureBody({ object, onSelect, editorEnabled }: {
  object: EngineSceneObject
  onSelect?: EngineSceneObjectsProps['onSelect']
  editorEnabled: boolean
}) {
  const settingsKey = JSON.stringify(object.cave ?? object.house)
  const colliders = useMemo(() => buildStructureColliders(object), [object.kind, settingsKey])

  return <RigidBody
    type="fixed"
    colliders={false}
    position={object.position}
    rotation={object.rotation}
    scale={object.scale}
  >
    {colliders.map(({ position, halfExtents }, index) => (
      <CuboidCollider key={index} args={halfExtents} position={position} />
    ))}
    <ObjectMesh object={object} selected={false} onSelect={onSelect} editorEnabled={editorEnabled} />
  </RigidBody>
}

function buildTrimesh(object: EngineSceneObject) {
  if (object.kind === 'mountain') {
    const { positions, indices } = generateMountain(clampMountainSettings(object.mountain))
    return { positions, indices, rampPositions: undefined, rampIndices: undefined }
  }
  return generateGrassPlane({ ...clampGrassPlaneSettings(object.grassPlane), bladeCount: 0 })
}

function TrimeshBody({ object, onSelect, editorEnabled }: {
  object: EngineSceneObject
  onSelect?: EngineSceneObjectsProps['onSelect']
  editorEnabled: boolean
}) {
  const settingsKey = JSON.stringify(object.kind === 'mountain' ? object.mountain : object.grassPlane)
  const { positions, indices, rampPositions, rampIndices } = useMemo(() => buildTrimesh(object), [object.kind, settingsKey])

  return <RigidBody
    type="fixed"
    colliders={false}
    position={object.position}
    rotation={object.rotation}
    scale={object.scale}
  >
    <TrimeshCollider args={[positions, indices]} />
    {rampIndices && rampIndices.length > 0 && <TrimeshCollider args={[rampPositions!, rampIndices]} />}
    <ObjectMesh object={object} selected={false} onSelect={onSelect} editorEnabled={editorEnabled} />
  </RigidBody>
}

function EditableObject({ object, transformMode, snapEnabled, selectionGuard, onSelect, onUpdate }: {
  object: EngineSceneObject
  transformMode: EngineSceneObjectsProps['transformMode']
  snapEnabled: boolean
  selectionGuard: React.MutableRefObject<number>
  onSelect?: EngineSceneObjectsProps['onSelect']
  onUpdate?: EngineSceneObjectsProps['onUpdate']
}) {
  const group = useRef<THREE.Group>(null!)
  const commitTransform = useCallback(() => {
    if (!group.current || !onUpdate) return
    const { position, rotation, scale } = group.current
    onUpdate(object.id, {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      scale: [scale.x, scale.y, scale.z],
    })
  }, [object.id, onUpdate])

  useEffect(
    () => () => {
      if (selectionGuard.current === Infinity) selectionGuard.current = 0
    },
    [selectionGuard],
  )

  return (
    <>
      <group ref={group} position={object.position} rotation={object.rotation} scale={object.scale}>
        <ObjectMesh object={object} selected onSelect={onSelect} editorEnabled />
      </group>
      <TransformControls
        object={group}
        mode={transformMode}
        translationSnap={snapEnabled ? 0.25 : null}
        rotationSnap={snapEnabled ? THREE.MathUtils.degToRad(15) : null}
        scaleSnap={snapEnabled ? 0.1 : null}
        size={0.82}
        onObjectChange={commitTransform}
        onMouseDown={() => {
          selectionGuard.current = Infinity
        }}
        onMouseUp={() => {
          selectionGuard.current = performance.now() + GIZMO_RELEASE_SELECTION_GUARD_MS
        }}
      />
    </>
  )
}

export default function EngineSceneObjects({
  objects,
  selectedId,
  editorEnabled,
  transformMode,
  snapEnabled,
  hiddenIds = [],
  onSelect,
  onUpdate,
}: EngineSceneObjectsProps) {
  const selectionGuard = useRef(0)
  const guardedSelect = useCallback(
    (id: string) => {
      if (performance.now() < selectionGuard.current) return
      onSelect?.(id)
    },
    [onSelect],
  )

  return <VegetationMask objects={objects}><group name="engine-scene-objects">
    {objects.map((object) => {
      if (!object.visible || hiddenIds.includes(object.id)) return null
      if (editorEnabled && selectedId === object.id) {
        return <EditableObject
          key={object.id}
          object={object}
          transformMode={transformMode}
          snapEnabled={snapEnabled}
          selectionGuard={selectionGuard}
          onSelect={guardedSelect}
          onUpdate={onUpdate}
        />
      }
      if (object.kind === 'character' && !editorEnabled) return null
      if (object.kind === 'model' && object.model?.collider === 'trimesh') {
        return <RigidBody
          key={object.id}
          type="fixed"
          colliders="trimesh"
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
        >
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
        </RigidBody>
      }
      if (NON_PHYSICAL_KINDS.includes(object.kind) || object.kind === 'model') {
        return <group key={object.id} position={object.position} rotation={object.rotation} scale={object.scale}>
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
        </group>
      }
      if (object.properties.collision === 'none') {
        return <group key={object.id} position={object.position} rotation={object.rotation} scale={object.scale}>
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
        </group>
      }
      if (object.kind === 'mountain' || object.kind === 'grass-plane') {
        return <TrimeshBody
          key={object.id}
          object={object}
          onSelect={editorEnabled && onSelect ? guardedSelect : undefined}
          editorEnabled={editorEnabled}
        />
      }
      if (object.kind === 'cave' || object.kind === 'house') {
        return <StructureBody
          key={object.id}
          object={object}
          onSelect={editorEnabled && onSelect ? guardedSelect : undefined}
          editorEnabled={editorEnabled}
        />
      }
      if (object.kind === 'rock') {
        return <RigidBody
          key={object.id}
          type="fixed"
          colliders="hull"
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
        >
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
        </RigidBody>
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
          <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
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
        <ObjectMesh object={object} selected={false} onSelect={editorEnabled && onSelect ? guardedSelect : undefined} editorEnabled={editorEnabled} />
      </RigidBody>
    })}
  </group></VegetationMask>
}
