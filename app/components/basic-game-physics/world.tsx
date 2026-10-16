import { Canvas, extend, useFrame, type RootState } from '@react-three/fiber'
import {
  KeyboardControls,
} from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import { Leva } from 'leva'
import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import CameraFollower from './camera'
import { CharacterController } from './character-controller'
import { GRAVITY } from './constants'
import EditorCamera from './editor-camera'
import EngineSceneObjects from './engine-scene-objects'
import FullscreenWrapper from './fullscreen'
import useGamepad from './gamepad'
import ImpactBurst from './impact-burst'
import PercentageProgress from './progress'
import Projectiles from './projectiles'
import GameInterface from './ui/interface'
import InventoryDialog from './ui/inventory-dialog'
import QuickSlots from './ui/quick-slots'
import ResourceBars from './ui/resource-bars'
import StatsDialog from './ui/stats-dialog'
import { useCharacterRuntime } from './use-character-runtime'
import { useGameDialogs } from './use-game-dialogs'
import { clampCharacterSettings } from '../game-engine/character-settings'
import { DEFAULT_BACKGROUND_COLOR } from '../game-engine/types'
import { BUILTIN_OBJECT_IDS } from '../game-engine/builtin-objects'
import type {
  EngineSceneObject,
  EngineWorldSettings,
  SceneObjectKind,
} from '../game-engine/types'

extend(THREE as any)

const DEFAULT_CHARACTER_SPAWN: [number, number, number] = [0, 0, 0]

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'attack', keys: ['KeyF'] },
  { name: 'roll', keys: ['KeyE'] },
]

interface BasicGamePhysicsProps {
  worldSettings?: EngineWorldSettings
  editorMode?: boolean
  isPlaying?: boolean
  sceneObjects?: EngineSceneObject[]
  selectedSceneObjectId?: string
  onSelectSceneObject?: (id: string) => void
  onCreateSceneObject?: (
    kind: SceneObjectKind,
    position: [number, number, number],
    modelId?: string,
  ) => void
  onUpdateSceneObject?: (id: string, patch: Partial<EngineSceneObject>) => void
  transformMode?: 'translate' | 'rotate' | 'scale'
  snapEnabled?: boolean
  debugColliders?: boolean
}

export default function BasicGamePhysics({
  worldSettings,
  editorMode = false,
  isPlaying = true,
  sceneObjects = [],
  selectedSceneObjectId,
  onSelectSceneObject,
  onCreateSceneObject,
  onUpdateSceneObject,
  transformMode = 'translate',
  snapEnabled = true,
  debugColliders = false,
}: BasicGamePhysicsProps) {
  const refCanvas = useRef<HTMLCanvasElement>(null!)
  const refScene = useRef<THREE.Scene>(null!)
  const [impactBursts, setImpactBursts] = useState<
    Array<{ id: number; position: [number, number, number] }>
  >([])
  const nextImpactId = useRef(0)
  const canvasState = useRef<RootState | null>(null)
  const gamepad = useGamepad()
  const backgroundColor = worldSettings?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
  const dialogs = useGameDialogs(isPlaying, gamepad)
  const characterObject = sceneObjects.find(({ id }) => id === BUILTIN_OBJECT_IDS.character)
  const characterSettings = useMemo(
    () => clampCharacterSettings(characterObject?.character),
    [characterObject?.character],
  )
  const runtime = useCharacterRuntime(characterSettings, gamepad, isPlaying)
  const characterSpawn = characterObject?.position ?? DEFAULT_CHARACTER_SPAWN

  const handleAttack = (position: [number, number, number]) => {
    nextImpactId.current += 1
    setImpactBursts((bursts) => [...bursts, { id: nextImpactId.current, position }])
  }

  const handleObjectDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const kind = event.dataTransfer.getData('application/x-world-object') as SceneObjectKind
    const modelId = event.dataTransfer.getData('application/x-world-model') || undefined
    const state = canvasState.current
    if (!kind || !state || !onCreateSceneObject) return

    const bounds = refCanvas.current.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 9.35)
    const placement = new THREE.Vector3()
    raycaster.setFromCamera(pointer, state.get().camera)

    if (raycaster.ray.intersectPlane(placementPlane, placement)) {
      onCreateSceneObject(kind, [placement.x, placement.y, placement.z], modelId)
    }
  }

  const isMobile =
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <FullscreenWrapper showControls={!editorMode}>
      <Leva hidden={editorMode} />
      {isMobile && <GameInterface />}
      {isPlaying && (
        <>
          <ResourceBars state={runtime.state} />
          <QuickSlots state={runtime.state} loadout={characterSettings.loadout} />
        </>
      )}
      {dialogs.active === 'inventory' && (
        <InventoryDialog settings={characterSettings.inventory} onClose={dialogs.close} />
      )}
      {dialogs.active === 'stats' && <StatsDialog runtime={runtime} onClose={dialogs.close} />}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          fallback={'Sorry no WebGL supported!'}
          style={{ height: '100%' }}
          ref={refCanvas}
          dpr={[1, 1.5]}
          shadows
          onCreated={(state) => {
            canvasState.current = state
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleObjectDrop}
        >
          <color attach="background" args={[backgroundColor]} />
          <fog
            attach="fog"
            args={[backgroundColor, worldSettings?.fogNear ?? 16, worldSettings?.fogFar ?? 78]}
          />

          <Suspense fallback={<PercentageProgress />}>
            <Physics gravity={[0, GRAVITY, 0]} colliders="trimesh" debug={debugColliders}>
              <scene ref={refScene}>
                <EngineSceneObjects
                  objects={sceneObjects}
                  selectedId={selectedSceneObjectId}
                  onSelect={onSelectSceneObject}
                  onUpdate={onUpdateSceneObject}
                  editorEnabled={editorMode && !isPlaying}
                  transformMode={transformMode}
                  snapEnabled={snapEnabled}
                />

                {isPlaying ? (
                  <CameraFollower refScene={refScene} />
                ) : (
                  <EditorCamera />
                )}

                {!isMobile && !editorMode && <Perf position="bottom-left" />}

                {isPlaying && (
                  <CharacterController
                    refScene={refScene}
                    gamepad={gamepad}
                    spawnPosition={characterSpawn}
                    characterSettings={characterSettings}
                    runtime={runtime}
                    onAttack={handleAttack}
                  />
                )}

                {impactBursts.map((burst) => (
                  <ImpactBurst
                    key={burst.id}
                    position={burst.position}
                    onComplete={() =>
                      setImpactBursts((bursts) => bursts.filter(({ id }) => id !== burst.id))
                    }
                  />
                ))}

                {isPlaying && <Projectiles refScene={refScene} />}
              </scene>
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </FullscreenWrapper>
  )
}
