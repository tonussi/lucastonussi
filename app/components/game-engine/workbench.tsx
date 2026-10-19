import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react'
import {
  Box,
  Braces,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Download,
  Eye,
  GitFork,
  Layers3,
  LandPlot,
  Move3d,
  Play,
  Plus,
  RotateCcw,
  Rotate3d,
  Save,
  Scaling,
  Square,
  Sparkles,
  Sprout,
  Trash2,
  Waves,
  House,
  Lightbulb,
  Droplets,
  Gem,
  Mountain,
  MountainSnow,
  Package,
  PersonStanding,
  Route,
  TreePine,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import BasicGamePhysics from '@/components/basic-game-physics/world'
import { MOTION_SETTINGS } from './character-settings'
import {
  defaultEngineProject,
  type EngineProject,
  type EngineSceneObject,
  type GenerationRecord,
  type SceneObjectKind,
  type CaveSettings,
  type GrassPlaneSettings,
  type GrassSettings,
  type HouseSettings,
  type LightSettings,
  type CharacterSettings,
  type MountainSettings,
  type OceanSettings,
  type PickupSettings,
  type PathSettings,
  type RockSettings,
  type WaterSettings,
  type TreeSettings,
  type JsonObject,
} from './types'
import { NON_DELETABLE_KINDS } from './builtin-objects'
import { CAVE_LIMITS, DEFAULT_CAVE_SETTINGS } from './cave-generator'
import ColorField from './color-field'
import { DEFAULT_GRASS_SETTINGS, GRASS_LIMITS } from './grass-generator'
import { DEFAULT_GRASS_PLANE_SETTINGS, GRASS_PLANE_LIMITS } from './grass-plane-generator'
import { DEFAULT_HOUSE_SETTINGS, HOUSE_LIMITS } from './house-layout'
import { DEFAULT_MOUNTAIN_SETTINGS, MOUNTAIN_LIMITS } from './mountain-generator'
import { DEFAULT_OCEAN_SETTINGS, OCEAN_LIMITS } from './ocean-generator'
import { DEFAULT_PATH_SETTINGS, PATH_LIMITS } from './path-generator'
import { DEFAULT_WATER_SETTINGS, WATER_LIMITS, WATER_SHAPES } from './water-generator'
import { DEFAULT_ROCK_SETTINGS, ROCK_LIMITS } from './rock-generator'
import { replaceWithScenario, SCENARIO_LIMITS, scenarioFog } from './scenario-generator'
import { CHARACTER_MODEL_IDS, MODEL_CATALOG } from './model-catalog'
import { ACTION_COST_LIMITS, ACTION_DURATION_LIMITS, ACTIONS } from './character-actions'
import { ITEMS, PICKUP_QUANTITY_LIMITS } from './items'
import { ATTRIBUTE_LIMITS, ATTRIBUTES, UNSPENT_POINTS_LIMITS } from './character-stats'
import { QUICK_SLOT_CATEGORIES } from './quick-slots'
import {
  AUTO_CLIP,
  CAMERA_ROTATION_SPEED_LIMITS,
  DASH_HOLD_LIMITS,
  JUMP_HEIGHT_LIMITS,
  ROLL_DURATION_LIMITS,
  ROLL_DISTANCE_LIMITS,
  RUN_SPEED_LIMITS,
  WALK_SPEED_LIMITS,
  CHARACTER_STATES,
  type CharacterClipField,
  clampCharacterSettings,
  INVENTORY_LIMITS,
  resizeInventoryTabs,
  TAB_NAME_MAX_LENGTH,
} from './character-settings'
import {
  DEFAULT_LIGHT_SETTINGS,
  LIGHT_LIMITS,
  LIGHT_SPAWN_HEIGHT,
  LIGHT_TYPES,
  MAX_SCENE_LIGHTS,
  ORBIT_LIGHT_TYPES,
  RANGED_LIGHT_TYPES,
} from './light-settings'
import { DEFAULT_TREE_SETTINGS, TREE_LIMITS } from './tree-generator'
import {
  ENGINE_PROJECT_STORAGE_KEY,
  normalizeProject,
  type EngineProjectInput,
  parseJsonValue,
  serializeProject,
  updateSceneObject as patchSceneObject,
} from './project-model'
import './engine.css'

function readProject(): EngineProject {
  if (typeof window === 'undefined') return defaultEngineProject
  try {
    const saved = window.localStorage.getItem(ENGINE_PROJECT_STORAGE_KEY)
    if (!saved) return defaultEngineProject
    return normalizeProject(JSON.parse(saved) as EngineProjectInput)
  } catch {
    return defaultEngineProject
  }
}

const OBJECT_KINDS: SceneObjectKind[] = ['cube', 'sphere', 'tree', 'grass', 'grass-plane', 'cave', 'house', 'mountain', 'rock', 'path', 'water', 'ocean', 'light']

interface PaletteItem {
  kind: SceneObjectKind
  label: string
  modelId?: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  ...OBJECT_KINDS.map((kind) => ({ kind, label: kind })),
  ...Object.entries(MODEL_CATALOG)
    .filter(([, { role }]) => role === 'prop')
    .map(([modelId, { label }]) => ({
      kind: 'model' as const,
      label,
      modelId,
    })),
]

const COLORLESS_KINDS: SceneObjectKind[] = ['model', 'character']

const SUPPORTED_SCHEMA_VERSIONS = [1, 2, 3, 4, 5]

const OBJECT_DEFAULTS: Record<SceneObjectKind, { label: string; color: string }> = {
  cube: { label: 'Cube', color: '#d8a64d' },
  sphere: { label: 'Sphere', color: '#5d9dd6' },
  tree: { label: 'Tree', color: '#4f9a45' },
  light: { label: 'Light', color: '#ffe9a8' },
  model: { label: 'Model', color: '#ffffff' },
  ocean: { label: 'Ocean', color: '#064b70' },
  character: { label: 'Character', color: '#ffffff' },
  grass: { label: 'Grass', color: '#5fae3e' },
  'grass-plane': { label: 'Grass Plane', color: '#5fae3e' },
  cave: { label: 'Cave', color: '#6f6a64' },
  house: { label: 'House', color: '#d9c7a3' },
  mountain: { label: 'Mountain', color: '#7b736a' },
  rock: { label: 'Rock', color: '#8b8780' },
  path: { label: 'Path', color: '#8a7152' },
  water: { label: 'Water', color: '#2f7fb8' },
  pickup: { label: 'Pickup', color: '#ffd166' },
}

const COLOR_LABELS: Partial<Record<SceneObjectKind, string>> = {
  tree: 'Leaf color',
  light: 'Light color',
  grass: 'Leaf color',
  'grass-plane': 'Grass color',
  cave: 'Rock color',
  house: 'Wall color',
  mountain: 'Rock color',
  rock: 'Rock color',
  path: 'Path color',
  water: 'Water color',
  pickup: 'Fallback color',
}

const SEED_RANGE = 100000

const randomSeed = () => Math.floor(Math.random() * SEED_RANGE)

function ObjectKindIcon({ kind, size }: { kind: SceneObjectKind; size: number }) {
  if (kind === 'sphere') return <Circle size={size} />
  if (kind === 'tree') return <TreePine size={size} />
  if (kind === 'light') return <Lightbulb size={size} />
  if (kind === 'grass') return <Sprout size={size} />
  if (kind === 'grass-plane') return <LandPlot size={size} />
  if (kind === 'cave') return <Mountain size={size} />
  if (kind === 'house') return <House size={size} />
  if (kind === 'mountain') return <MountainSnow size={size} />
  if (kind === 'model') return <Package size={size} />
  if (kind === 'ocean') return <Waves size={size} />
  if (kind === 'rock') return <Gem size={size} />
  if (kind === 'pickup') return <Package size={size} />
  if (kind === 'water') return <Droplets size={size} />
  if (kind === 'path') return <Route size={size} />
  if (kind === 'character') return <PersonStanding size={size} />
  return <Box size={size} />
}

interface NumericField<Settings> {
  key: keyof Settings & string
  label: string
  limits?: { min: number; max: number }
  step: number
}

const GRASS_FIELDS: NumericField<GrassSettings>[] = [
  { key: 'bladeCount', label: 'Leaves', limits: GRASS_LIMITS.bladeCount, step: 1 },
  { key: 'height', label: 'Plant height', limits: GRASS_LIMITS.height, step: 0.05 },
  { key: 'width', label: 'Area width', limits: GRASS_LIMITS.width, step: 0.5 },
  { key: 'depth', label: 'Area depth', limits: GRASS_LIMITS.depth, step: 0.5 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const GRASS_PLANE_FIELDS: NumericField<GrassPlaneSettings>[] = [
  { key: 'width', label: 'Plane width', limits: GRASS_PLANE_LIMITS.width, step: 0.5 },
  { key: 'depth', label: 'Plane depth', limits: GRASS_PLANE_LIMITS.depth, step: 0.5 },
  { key: 'thickness', label: 'Thickness', limits: GRASS_PLANE_LIMITS.thickness, step: 0.5 },
  { key: 'bladeCount', label: 'Grass quantity', limits: GRASS_PLANE_LIMITS.bladeCount, step: 100 },
  { key: 'bladeHeight', label: 'Grass height', limits: GRASS_PLANE_LIMITS.bladeHeight, step: 0.05 },
  { key: 'shapeRandomness', label: 'Shape randomness', limits: GRASS_PLANE_LIMITS.shapeRandomness, step: 0.05 },
  { key: 'edgeDropPosX', label: 'Bank drop +X', limits: GRASS_PLANE_LIMITS.edgeDrop, step: 0.5 },
  { key: 'edgeDropNegX', label: 'Bank drop -X', limits: GRASS_PLANE_LIMITS.edgeDrop, step: 0.5 },
  { key: 'edgeDropPosZ', label: 'Bank drop +Z', limits: GRASS_PLANE_LIMITS.edgeDrop, step: 0.5 },
  { key: 'edgeDropNegZ', label: 'Bank drop -Z', limits: GRASS_PLANE_LIMITS.edgeDrop, step: 0.5 },
  { key: 'rampRunRatio', label: 'Bank length ratio', limits: GRASS_PLANE_LIMITS.rampRunRatio, step: 0.1 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const CAVE_FIELDS: NumericField<CaveSettings>[] = [
  { key: 'radius', label: 'Cave radius', limits: CAVE_LIMITS.radius, step: 0.5 },
  { key: 'depth', label: 'Cave depth', limits: CAVE_LIMITS.depth, step: 1 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const MOUNTAIN_FIELDS: NumericField<MountainSettings>[] = [
  { key: 'height', label: 'Mountain height', limits: MOUNTAIN_LIMITS.height, step: 1 },
  { key: 'radius', label: 'Base radius', limits: MOUNTAIN_LIMITS.radius, step: 1 },
  { key: 'peakCount', label: 'Peaks', limits: MOUNTAIN_LIMITS.peakCount, step: 1 },
  { key: 'roughness', label: 'Roughness', limits: MOUNTAIN_LIMITS.roughness, step: 0.05 },
  { key: 'snowLine', label: 'Snow line', limits: MOUNTAIN_LIMITS.snowLine, step: 0.05 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const ROCK_FIELDS: NumericField<RockSettings>[] = [
  { key: 'size', label: 'Rock size', limits: ROCK_LIMITS.size, step: 0.1 },
  { key: 'roughness', label: 'Roughness', limits: ROCK_LIMITS.roughness, step: 0.05 },
  { key: 'flatness', label: 'Height ratio', limits: ROCK_LIMITS.flatness, step: 0.05 },
  { key: 'elongation', label: 'Elongation', limits: ROCK_LIMITS.elongation, step: 0.1 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const PATH_FIELDS: NumericField<PathSettings>[] = [
  { key: 'length', label: 'Path length', limits: PATH_LIMITS.length, step: 2 },
  { key: 'width', label: 'Path width', limits: PATH_LIMITS.width, step: 0.5 },
  { key: 'wiggle', label: 'Wiggle', limits: PATH_LIMITS.wiggle, step: 0.05 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const OCEAN_FIELDS: NumericField<OceanSettings>[] = [
  { key: 'size', label: 'Ocean size', limits: OCEAN_LIMITS.size, step: 10 },
  { key: 'segments', label: 'Detail', limits: OCEAN_LIMITS.segments, step: 8 },
  { key: 'waveCount', label: 'Waves', limits: OCEAN_LIMITS.waveCount, step: 1 },
  { key: 'amplitude', label: 'Wave height', limits: OCEAN_LIMITS.amplitude, step: 0.1 },
  { key: 'windDirection', label: 'Wave direction', limits: OCEAN_LIMITS.windDirection, step: 15 },
  { key: 'seed', label: 'Seed', step: 1 },
]

const HOUSE_FIELDS: NumericField<HouseSettings>[] = [
  { key: 'width', label: 'House width', limits: HOUSE_LIMITS.width, step: 0.5 },
  { key: 'depth', label: 'House depth', limits: HOUSE_LIMITS.depth, step: 0.5 },
  { key: 'wallHeight', label: 'Wall height', limits: HOUSE_LIMITS.wallHeight, step: 0.5 },
  { key: 'roofHeight', label: 'Roof height', limits: HOUSE_LIMITS.roofHeight, step: 0.5 },
]

function NumericSettingsFields<Settings extends object>({
  fields,
  settings,
  onChange,
}: {
  fields: NumericField<Settings>[]
  settings: Settings
  onChange: (settings: Settings) => void
}) {
  return (
    <>
      {fields.map(({ key, label, limits, step }) => (
        <NumberField
          key={key}
          label={label}
          value={settings[key] as number}
          min={limits?.min}
          max={limits?.max}
          step={step}
          onChange={(value) => onChange({ ...settings, [key]: value })}
        />
      ))}
      {'seed' in settings && (
        <button type="button" onClick={() => onChange({ ...settings, seed: randomSeed() })}>
          <Sparkles size={13} /> Regenerate
        </button>
      )}
    </>
  )
}

function LightFields({
  settings,
  onChange,
}: {
  settings: LightSettings
  onChange: (settings: LightSettings) => void
}) {
  const update = <Key extends keyof LightSettings>(key: Key, value: LightSettings[Key]) =>
    onChange({ ...settings, [key]: value })
  return (
    <>
      <label className="engine-field">
        <span>Light type</span>
        <select
          value={settings.lightType}
          onChange={(event) => update('lightType', event.target.value as LightSettings['lightType'])}
        >
          {LIGHT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
      <NumberField
        label="Intensity"
        value={settings.intensity}
        min={LIGHT_LIMITS.intensity.min}
        max={LIGHT_LIMITS.intensity.max}
        step={5}
        onChange={(value) => update('intensity', value)}
      />
      {RANGED_LIGHT_TYPES.includes(settings.lightType) && (
        <NumberField
          label="Range"
          value={settings.distance}
          min={LIGHT_LIMITS.distance.min}
          max={LIGHT_LIMITS.distance.max}
          step={1}
          onChange={(value) => update('distance', value)}
        />
      )}
      {ORBIT_LIGHT_TYPES.includes(settings.lightType) && (
        <>
          <NumberField
            label="Orbit radius"
            value={settings.orbitRadius}
            min={LIGHT_LIMITS.orbitRadius.min}
            max={LIGHT_LIMITS.orbitRadius.max}
            step={0.5}
            onChange={(value) => update('orbitRadius', value)}
          />
          <NumberField
            label="Orbit speed (°/s)"
            value={settings.orbitSpeed}
            min={LIGHT_LIMITS.orbitSpeed.min}
            max={LIGHT_LIMITS.orbitSpeed.max}
            step={5}
            onChange={(value) => update('orbitSpeed', value)}
          />
        </>
      )}
      {settings.lightType === 'spot' && (
        <NumberField
          label="Cone angle"
          value={settings.angle}
          min={LIGHT_LIMITS.angle.min}
          max={LIGHT_LIMITS.angle.max}
          step={5}
          onChange={(value) => update('angle', value)}
        />
      )}
    </>
  )
}

function CharacterFields({
  settings,
  onChange,
}: {
  settings: CharacterSettings
  onChange: (settings: CharacterSettings) => void
}) {
  const clips = MODEL_CATALOG[settings.modelId].clips
  const clipSelect = (label: string, key: CharacterClipField) => (
    <label key={key} className="engine-field">
      <span>{label}</span>
      <select
        value={settings[key]}
        onChange={(event) => onChange({ ...settings, [key]: event.target.value })}
      >
        <option value={AUTO_CLIP}>Auto</option>
        {clips.map((clip) => (
          <option key={clip} value={clip}>{clip}</option>
        ))}
      </select>
    </label>
  )
  return (
    <>
      <label className="engine-field">
        <span>Character model</span>
        <select
          value={settings.modelId}
          onChange={(event) => onChange(clampCharacterSettings({ modelId: event.target.value }))}
        >
          {CHARACTER_MODEL_IDS.map((modelId) => (
            <option key={modelId} value={modelId}>{MODEL_CATALOG[modelId].label}</option>
          ))}
        </select>
      </label>
      {CHARACTER_STATES.map(({ label, field }) => clipSelect(label, field))}
      <NumberField
        label="Inventory slots"
        value={settings.inventory.slots}
        min={INVENTORY_LIMITS.slots.min}
        max={INVENTORY_LIMITS.slots.max}
        step={1}
        onChange={(slots) => onChange({ ...settings, inventory: { ...settings.inventory, slots } })}
      />
      <NumberField
        label="Inventory tabs"
        value={settings.inventory.tabNames.length}
        min={INVENTORY_LIMITS.tabs.min}
        max={INVENTORY_LIMITS.tabs.max}
        step={1}
        onChange={(count) =>
          onChange({
            ...settings,
            inventory: { ...settings.inventory, tabNames: resizeInventoryTabs(settings.inventory.tabNames, count) },
          })
        }
      />
      <label className="engine-field">
        <span>Camera speed {settings.cameraRotationSpeed.toFixed(1)}</span>
        <input
          type="range"
          min={CAMERA_ROTATION_SPEED_LIMITS.min}
          max={CAMERA_ROTATION_SPEED_LIMITS.max}
          step={0.1}
          value={settings.cameraRotationSpeed}
          onChange={(event) => onChange({ ...settings, cameraRotationSpeed: Number(event.target.value) })}
        />
      </label>
      <NumberField
        label="Walk speed"
        value={settings.walkSpeed}
        min={WALK_SPEED_LIMITS.min}
        max={WALK_SPEED_LIMITS.max}
        step={0.5}
        onChange={(walkSpeed) => onChange({ ...settings, walkSpeed })}
      />
      {(Object.keys(MOTION_SETTINGS) as (keyof typeof MOTION_SETTINGS)[]).map(key => (
        <NumberField key={key} label={MOTION_SETTINGS[key].label} value={settings[key]}
          min={MOTION_SETTINGS[key].min} max={MOTION_SETTINGS[key].max} step={0.05}
          onChange={value => onChange({ ...settings, [key]: value })} />
      ))}
      <NumberField
        label="Run speed"
        value={settings.runSpeed}
        min={RUN_SPEED_LIMITS.min}
        max={RUN_SPEED_LIMITS.max}
        step={0.5}
        onChange={(runSpeed) => onChange({ ...settings, runSpeed })}
      />
      <NumberField
        label="Jump height"
        value={settings.jumpHeight}
        min={JUMP_HEIGHT_LIMITS.min}
        max={JUMP_HEIGHT_LIMITS.max}
        step={0.5}
        onChange={(jumpHeight) => onChange({ ...settings, jumpHeight })}
      />
      <NumberField
        label="Roll duration"
        value={settings.rollDuration}
        min={ROLL_DURATION_LIMITS.min}
        max={ROLL_DURATION_LIMITS.max}
        step={0.05}
        onChange={(rollDuration) => onChange({ ...settings, rollDuration })}
      />
      <NumberField
        label="Roll distance"
        value={settings.rollDistance}
        min={ROLL_DISTANCE_LIMITS.min}
        max={ROLL_DISTANCE_LIMITS.max}
        step={0.5}
        onChange={(rollDistance) => onChange({ ...settings, rollDistance })}
      />
      <NumberField
        label="Hold B to run (s)"
        value={settings.dashHoldSeconds}
        min={DASH_HOLD_LIMITS.min}
        max={DASH_HOLD_LIMITS.max}
        step={0.05}
        onChange={(dashHoldSeconds) => onChange({ ...settings, dashHoldSeconds })}
      />
      {ACTIONS.map(({ id, label, resourceId }) => (
        <div key={id}>
          <NumberField
            label={`${label} duration`}
            value={settings.actions[id].duration}
            min={ACTION_DURATION_LIMITS.min}
            max={ACTION_DURATION_LIMITS.max}
            step={0.05}
            onChange={(duration) => onChange({ ...settings, actions: { ...settings.actions, [id]: { ...settings.actions[id], duration } } })}
          />
          {resourceId && (
            <NumberField
              label={`${label} cost`}
              value={settings.actions[id].cost}
              min={ACTION_COST_LIMITS.min}
              max={ACTION_COST_LIMITS.max}
              step={1}
              onChange={(cost) => onChange({ ...settings, actions: { ...settings.actions, [id]: { ...settings.actions[id], cost } } })}
            />
          )}
        </div>
      ))}
      {(['sword', 'shield'] as const).map((piece) => (
        <label key={piece} className="engine-switch">
          <span>Show {piece}</span>
          <input
            type="checkbox"
            checked={settings.equipment[piece]}
            onChange={(event) => onChange({ ...settings, equipment: { ...settings.equipment, [piece]: event.target.checked } })}
          />
        </label>
      ))}
      <NumberField
        label="Unspent points"
        value={settings.unspentPoints}
        min={UNSPENT_POINTS_LIMITS.min}
        max={UNSPENT_POINTS_LIMITS.max}
        step={1}
        onChange={(unspentPoints) => onChange({ ...settings, unspentPoints })}
      />
      {ATTRIBUTES.map(({ id, label }) => (
        <NumberField
          key={id}
          label={label}
          value={settings.attributes[id]}
          min={ATTRIBUTE_LIMITS.min}
          max={ATTRIBUTE_LIMITS.max}
          step={1}
          onChange={(value) => onChange({ ...settings, attributes: { ...settings.attributes, [id]: value } })}
        />
      ))}
      {QUICK_SLOT_CATEGORIES.map(({ id, label, dpad }) => (
        <label key={id} className="engine-field">
          <span>{label} (D-pad {dpad})</span>
          <textarea
            rows={3}
            placeholder="One item per line"
            defaultValue={settings.loadout[id].join('\n')}
            onBlur={(event) =>
              onChange({ ...settings, loadout: { ...settings.loadout, [id]: event.target.value.split('\n') } })
            }
          />
        </label>
      ))}
      {settings.inventory.tabNames.map((name, index) => (
        <label key={index} className="engine-field">
          <span>Tab {index + 1} name</span>
          <input
            value={name}
            maxLength={TAB_NAME_MAX_LENGTH}
            onChange={(event) => {
              const tabNames = settings.inventory.tabNames.map((current, tab) => (tab === index ? event.target.value : current))
              onChange({ ...settings, inventory: { ...settings.inventory, tabNames } })
            }}
          />
        </label>
      ))}
    </>
  )
}

function WaterFields({
  settings,
  onChange,
}: {
  settings: WaterSettings
  onChange: (settings: WaterSettings) => void
}) {
  const isLake = settings.shape === 'lake'
  return (
    <>
      <label className="engine-field">
        <span>Shape</span>
        <select
          value={settings.shape}
          onChange={(event) => onChange({ ...settings, shape: event.target.value as WaterSettings['shape'] })}
        >
          {WATER_SHAPES.map((shape) => (
            <option key={shape} value={shape}>{shape}</option>
          ))}
        </select>
      </label>
      <NumberField
        label={isLake ? 'Lake radius' : 'River length'}
        value={settings.size}
        min={WATER_LIMITS.size.min}
        max={WATER_LIMITS.size.max}
        step={1}
        onChange={(size) => onChange({ ...settings, size })}
      />
      {!isLake && (
        <>
          <NumberField
            label="River width"
            value={settings.width}
            min={WATER_LIMITS.width.min}
            max={WATER_LIMITS.width.max}
            step={0.5}
            onChange={(width) => onChange({ ...settings, width })}
          />
          <NumberField
            label="Wiggle"
            value={settings.wiggle}
            min={WATER_LIMITS.wiggle.min}
            max={WATER_LIMITS.wiggle.max}
            step={0.05}
            onChange={(wiggle) => onChange({ ...settings, wiggle })}
          />
        </>
      )}
      <NumberField label="Seed" value={settings.seed} step={1} onChange={(seed) => onChange({ ...settings, seed })} />
      <button type="button" onClick={() => onChange({ ...settings, seed: randomSeed() })}>
        <Sparkles size={13} /> Regenerate
      </button>
    </>
  )
}

function PickupFields({
  settings,
  onChange,
}: {
  settings: PickupSettings
  onChange: (settings: PickupSettings) => void
}) {
  return (
    <>
      <label className="engine-field">
        <span>Item</span>
        <select value={settings.itemId} onChange={(event) => onChange({ ...settings, itemId: event.target.value })}>
          {ITEMS.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </label>
      <NumberField
        label="Quantity"
        value={settings.quantity}
        min={PICKUP_QUANTITY_LIMITS.min}
        max={PICKUP_QUANTITY_LIMITS.max}
        step={1}
        onChange={(quantity) => onChange({ ...settings, quantity })}
      />
    </>
  )
}

function TreeFields({
  settings,
  onChange,
}: {
  settings: TreeSettings
  onChange: (settings: TreeSettings) => void
}) {
  const update = (key: keyof TreeSettings, value: number) => onChange({ ...settings, [key]: value })
  return (
    <>
      <NumberField
        label="Tree height"
        value={settings.height}
        min={TREE_LIMITS.height.min}
        max={TREE_LIMITS.height.max}
        step={0.5}
        onChange={(value) => update('height', value)}
      />
      <NumberField
        label="Branches"
        value={settings.branchCount}
        min={TREE_LIMITS.branchCount.min}
        max={TREE_LIMITS.branchCount.max}
        step={1}
        onChange={(value) => update('branchCount', value)}
      />
      <NumberField
        label="Leaves"
        value={settings.leafCount}
        min={TREE_LIMITS.leafCount.min}
        max={TREE_LIMITS.leafCount.max}
        step={10}
        onChange={(value) => update('leafCount', value)}
      />
      <NumberField
        label="Leaf size"
        value={settings.leafSize}
        min={TREE_LIMITS.leafSize.min}
        max={TREE_LIMITS.leafSize.max}
        step={0.05}
        onChange={(value) => update('leafSize', value)}
      />
      <NumberField label="Tree seed" value={settings.seed} step={1} onChange={(value) => update('seed', value)} />
      <button type="button" onClick={() => update('seed', randomSeed())}>
        <Sparkles size={13} /> Regenerate
      </button>
    </>
  )
}

function PropertyRow({
  name,
  value,
  onCommit,
  onRemove,
}: {
  name: string
  value: JsonObject[string]
  onCommit: (previousName: string, name: string, source: string) => void
  onRemove: () => void
}) {
  const [propertyName, setPropertyName] = useState(name)
  const [source, setSource] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState('')

  useEffect(() => {
    setPropertyName(name)
    setSource(JSON.stringify(value, null, 2))
    setError('')
  }, [name, value])

  const commit = () => {
    try {
      if (!propertyName.trim()) throw new Error('Property name is required')
      parseJsonValue(source)
      onCommit(name, propertyName.trim(), source)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid JSON value')
    }
  }

  return (
    <div className="engine-property-row">
      <input
        aria-label="Property name"
        value={propertyName}
        onChange={(event) => setPropertyName(event.target.value)}
      />
      <textarea
        aria-label={`${propertyName || name} JSON value`}
        value={source}
        rows={Math.min(5, source.split('\n').length + 1)}
        onChange={(event) => setSource(event.target.value)}
      />
      <button type="button" onClick={commit}>Apply</button>
      <button type="button" className="engine-property-remove" onClick={onRemove}>
        <Trash2 size={13} aria-hidden="true" />
        <span className="sr-only">Remove {name}</span>
      </button>
      {error && <small role="alert">{error}</small>}
    </div>
  )
}

function ObjectProperties({
  object,
  disabled,
  onChange,
}: {
  object: EngineSceneObject
  disabled: boolean
  onChange: (properties: JsonObject) => void
}) {
  const [draftName, setDraftName] = useState('')
  const [draftValue, setDraftValue] = useState('null')
  const [error, setError] = useState('')

  const commit = (previousName: string, name: string, source: string) => {
    const value = parseJsonValue(source)
    const properties = { ...object.properties }
    if (previousName !== name) delete properties[previousName]
    properties[name] = value
    onChange(properties)
  }

  const addProperty = () => {
    try {
      const name = draftName.trim()
      if (!name) throw new Error('Property name is required')
      if (name in object.properties) throw new Error('Property name already exists')
      commit(name, name, draftValue)
      setDraftName('')
      setDraftValue('null')
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid JSON value')
    }
  }

  return (
    <div className={`engine-properties ${disabled ? 'is-disabled' : ''}`} aria-disabled={disabled}>
      <div className="engine-properties-heading">
        <span><Braces size={14} /> OBJECT PROPERTIES</span>
        <small>{object.name}</small>
      </div>
      <div className="engine-properties-body">
        {disabled && <p className="engine-properties-notice">Stop play mode to edit object data.</p>}
        <fieldset disabled={disabled}>
          {Object.entries(object.properties).map(([name, value]) => (
            <PropertyRow
              key={name}
              name={name}
              value={value}
              onCommit={commit}
              onRemove={() => {
                const properties = { ...object.properties }
                delete properties[name]
                onChange(properties)
              }}
            />
          ))}
          {Object.keys(object.properties).length === 0 && (
            <p className="engine-empty-properties">No custom properties yet.</p>
          )}
          <div className="engine-property-add">
            <input
              aria-label="New property name"
              placeholder="hitPoints"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <textarea
              aria-label="New property JSON value"
              rows={2}
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
            />
            <button type="button" onClick={addProperty}><Plus size={13} /> Add property</button>
            {error && <small role="alert">{error}</small>}
          </div>
        </fieldset>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="engine-field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default function GameEngineWorkbench() {
  const [project, setProject] = useState<EngineProject>(readProject)
  const [nodes, setNodes, onNodesChange] = useNodesState(project.flow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(project.flow.edges)
  const [selectedObject, setSelectedObject] = useState('world')
  const [savedLabel, setSavedLabel] = useState('Local draft')
  const [graphOpen, setGraphOpen] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [selectionLocked, setSelectionLocked] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProject = useCallback((recipe: (current: EngineProject) => EngineProject) => {
    setProject((current) => recipe(current))
    setSavedLabel('Unsaved changes')
  }, [])

  useEffect(() => {
    setProject((current) => ({ ...current, flow: { nodes, edges } }))
    setSavedLabel('Unsaved changes')
  }, [nodes, edges])

  const saveProject = useCallback(() => {
    const next = { ...project, updatedAt: new Date().toISOString(), flow: { nodes, edges } }
    window.localStorage.setItem(ENGINE_PROJECT_STORAGE_KEY, serializeProject(next))
    setProject(next)
    setSavedLabel('Saved locally')
  }, [edges, nodes, project])

  const exportProject = useCallback(() => {
    const payload = { ...project, updatedAt: new Date().toISOString(), flow: { nodes, edges } }
    const link = document.createElement('a')
    link.href = URL.createObjectURL(
      new Blob([serializeProject(payload)], { type: 'application/json' }),
    )
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'world'}.engine.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }, [edges, nodes, project])

  const importProject = useCallback(
    (file?: File) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const raw = JSON.parse(String(reader.result)) as EngineProjectInput
          if (!SUPPORTED_SCHEMA_VERSIONS.includes(raw.schemaVersion ?? 0) || !raw.world || !raw.flow) {
            throw new Error('Unsupported world file')
          }
          const parsed = normalizeProject(raw)
          setProject(parsed)
          setNodes(parsed.flow.nodes)
          setEdges(parsed.flow.edges)
          setSavedLabel('Imported · unsaved')
        } catch {
          setSavedLabel('Invalid engine JSON')
        }
      }
      reader.readAsText(file)
    },
    [setEdges, setNodes],
  )

  const generate = useCallback(() => {
    const { seed, count, radius } = project.procedural
    const record: GenerationRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      seed,
      count,
      radius,
    }
    updateProject((current) => {
      return {
        ...current,
        procedural: { ...current.procedural, seed: current.procedural.seed + 1 },
        world: { ...current.world, ...scenarioFog(current.procedural) },
        sceneObjects: replaceWithScenario(current.sceneObjects, current.procedural),
        generations: [record, ...current.generations].slice(0, 20),
      }
    })
  }, [project.procedural, updateProject])

  const updateWorld = <Key extends keyof EngineProject['world']>(key: Key, value: EngineProject['world'][Key]) =>
    updateProject((current) => ({ ...current, world: { ...current.world, [key]: value } }))

  const updateProcedural = (key: keyof EngineProject['procedural'], value: number) =>
    updateProject((current) => ({
      ...current,
      procedural: { ...current.procedural, [key]: value },
    }))

  const createSceneObject = (
    kind: SceneObjectKind,
    position: [number, number, number],
    modelId?: string,
  ) => {
    const catalogModel = modelId ? MODEL_CATALOG[modelId] : undefined
    if (kind === 'model' && !catalogModel) {
      setSavedLabel('Unknown model')
      return
    }
    const lightCount = project.sceneObjects.filter((object) => object.kind === 'light').length
    if (kind === 'light' && lightCount >= MAX_SCENE_LIGHTS) {
      setSavedLabel(`Light limit reached (${MAX_SCENE_LIGHTS})`)
      return
    }
    const sameKindCount = project.sceneObjects.filter(
      (object) => object.kind === kind && object.model?.modelId === modelId,
    ).length
    const label = catalogModel?.label ?? OBJECT_DEFAULTS[kind].label
    const object: EngineSceneObject = {
      id: crypto.randomUUID(),
      name: `${label} ${sameKindCount + 1}`,
      kind,
      position: kind === 'light' ? [position[0], position[1] + LIGHT_SPAWN_HEIGHT, position[2]] : position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: OBJECT_DEFAULTS[kind].color,
      visible: true,
      ...(kind === 'light' && { light: DEFAULT_LIGHT_SETTINGS }),
      ...(catalogModel && modelId && {
        model: { modelId, collider: catalogModel.defaultCollider },
      }),
      ...(kind === 'tree' && {
        tree: { ...DEFAULT_TREE_SETTINGS, seed: randomSeed() },
      }),
      ...(kind === 'grass' && { grass: { ...DEFAULT_GRASS_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'grass-plane' && { grassPlane: { ...DEFAULT_GRASS_PLANE_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'cave' && { cave: { ...DEFAULT_CAVE_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'house' && { house: DEFAULT_HOUSE_SETTINGS }),
      ...(kind === 'rock' && { rock: { ...DEFAULT_ROCK_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'water' && { water: { ...DEFAULT_WATER_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'path' && { path: { ...DEFAULT_PATH_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'ocean' && { ocean: { ...DEFAULT_OCEAN_SETTINGS, seed: randomSeed() } }),
      ...(kind === 'mountain' && { mountain: { ...DEFAULT_MOUNTAIN_SETTINGS, seed: randomSeed() } }),
      properties: {},
    }
    updateProject((current) => ({
      ...current,
      sceneObjects: [...current.sceneObjects, object],
    }))
    setSelectedObject(object.id)
  }

  const updateSceneObject = (id: string, patch: Partial<EngineSceneObject>) =>
    updateProject((current) => patchSceneObject(current, id, patch))

  const selectedSceneObject = project.sceneObjects.find(({ id }) => id === selectedObject)

  const resetProject = () => {
    setProject(defaultEngineProject)
    setNodes(defaultEngineProject.flow.nodes)
    setEdges(defaultEngineProject.flow.edges)
    setSavedLabel('Reset · unsaved')
  }

  useEffect(() => {
    if (!isPlaying) return
    const stopPlaying = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setIsPlaying(false)
    }
    window.addEventListener('keydown', stopPlaying)
    return () => window.removeEventListener('keydown', stopPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) return
    const selectTransformTool = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.code === 'Digit1') setTransformMode('translate')
      if (event.code === 'Digit2') setTransformMode('rotate')
      if (event.code === 'Digit3') setTransformMode('scale')
    }
    window.addEventListener('keydown', selectTransformTool)
    return () => window.removeEventListener('keydown', selectTransformTool)
  }, [isPlaying])

  return (
    <main className={`engine-shell ${graphOpen ? '' : 'engine-shell--graph-closed'}`}>
      <header className="engine-toolbar">
        <div className="engine-brand">
          <span className="engine-brand-mark">
            <Braces size={17} />
          </span>
          <div>
            <strong>World Engine</strong>
            <small>experimental / v0.1</small>
          </div>
        </div>
        <input
          className="engine-project-name"
          aria-label="Project name"
          value={project.name}
          onChange={(event) =>
            updateProject((current) => ({ ...current, name: event.target.value }))
          }
        />
        <div className="engine-toolbar-actions">
          <span className="engine-save-status">
            <CircleDot size={12} /> {savedLabel}
          </span>
          <button type="button" onClick={resetProject} title="Reset draft">
            <RotateCcw size={16} />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import
          </button>
          <button type="button" onClick={exportProject}>
            <Download size={16} /> Export
          </button>
          <button type="button" className="engine-primary" onClick={saveProject}>
            <Save size={16} /> Save
          </button>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(event) => importProject(event.target.files?.[0])}
          />
        </div>
      </header>

      <aside className="engine-panel engine-explorer" aria-label="World manager">
        <div className="engine-panel-title">
          <span>
            <Layers3 size={15} /> Manager
          </span>
          <button>
            <Plus size={15} />
          </button>
        </div>
        <div className="engine-section-label">ADD OBJECT</div>
        <div className="engine-object-palette">
          {PALETTE_ITEMS.map(({ kind, label, modelId }) => (
            <button
              key={modelId ?? kind}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-world-object', kind)
                event.dataTransfer.setData('application/x-world-model', modelId ?? '')
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onDoubleClick={() => createSceneObject(kind, [0, -9.35, 0], modelId)}
              title={`Drag ${label} into the viewport`}
            >
              <ObjectKindIcon kind={kind} size={16} />
              <span>{label}</span>
              <small>drag to map</small>
            </button>
          ))}
        </div>
        <div className="engine-section-label">SCENE</div>
        <button
          className={`engine-tree-row ${selectedObject === 'world' ? 'is-active' : ''}`}
          onClick={() => setSelectedObject('world')}
        >
          <ChevronDown size={14} />
          <Layers3 size={14} />
          <span>World</span>
          <Eye size={13} />
        </button>
        {project.sceneObjects.map((object) => (
          <button
            key={object.id}
            className={`engine-tree-row engine-tree-child ${selectedObject === object.id ? 'is-active' : ''}`}
            onClick={() => setSelectedObject(object.id)}
          >
            <ChevronRight size={12} />
            <ObjectKindIcon kind={object.kind} size={13} />
            <span>{object.name}</span>
            <Eye size={13} opacity={object.visible ? 1 : 0.3} />
          </button>
        ))}
        {['Physics Playground'].map((name) => (
          <button
            key={name}
            className={`engine-tree-row engine-tree-child ${selectedObject === name ? 'is-active' : ''}`}
            onClick={() => setSelectedObject(name)}
          >
            <ChevronRight size={12} />
            <Box size={13} />
            <span>{name}</span>
            <Eye size={13} />
          </button>
        ))}
        <button
          className={`engine-tree-row ${selectedObject === 'procedural' ? 'is-active' : ''}`}
          onClick={() => setSelectedObject('procedural')}
        >
          <ChevronRight size={14} />
          <Sparkles size={14} />
          <span>Procedural</span>
          <Eye size={13} />
        </button>
        <div className="engine-section-label">GENERATIONS · {project.generations.length}</div>
        <div className="engine-generation-list">
          {project.generations.length === 0 ? (
            <p>No snapshots yet.</p>
          ) : (
            project.generations.map((generation) => (
              <button key={generation.id} onClick={() => updateProcedural('seed', generation.seed)}>
                <Sparkles size={12} />
                <span>Seed {generation.seed}</span>
                <small>{generation.count} objects</small>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="engine-viewport" aria-label="Game viewport">
        <div className="engine-viewport-bar">
          <span>
            <span className="engine-live-dot" /> LIVE VIEWPORT
          </span>
          <span>
            {isPlaying ? 'PLAY MODE · RB / F IMPACT · ESC TO STOP' : 'EDIT MODE · MOUSE + WASD'}
          </span>
        </div>
        {!isPlaying && (
          <div className="engine-transform-toolbar" aria-label="Transform tools">
            {([
              ['translate', Move3d, 'Move (1)'],
              ['rotate', Rotate3d, 'Rotate (2)'],
              ['scale', Scaling, 'Scale (3)'],
            ] as const).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                className={transformMode === mode ? 'is-active' : ''}
                aria-label={label}
                aria-pressed={transformMode === mode}
                onClick={() => setTransformMode(mode)}
              ><Icon size={14} /></button>
            ))}
            <button
              type="button"
              className={snapEnabled ? 'is-active' : ''}
              aria-pressed={snapEnabled}
              onClick={() => setSnapEnabled((enabled) => !enabled)}
            >SNAP</button>
            <button
              type="button"
              className={selectionLocked ? 'is-active' : ''}
              aria-pressed={selectionLocked}
              title="Block selecting objects in the viewport"
              onClick={() => setSelectionLocked((locked) => !locked)}
            >LOCK</button>
            <button
              type="button"
              title="Deselect the current object and hide its gizmo"
              disabled={!selectedSceneObject}
              onClick={() => setSelectedObject('world')}
            >DESELECT</button>
          </div>
        )}
        <div className="engine-world-frame">
          <BasicGamePhysics
            worldSettings={project.world}
            editorMode
            isPlaying={isPlaying}
            debugColliders={project.debug.collisionShapes}
            sceneObjects={project.sceneObjects}
            selectedSceneObjectId={selectedSceneObject?.id}
            onSelectSceneObject={isPlaying || selectionLocked ? undefined : setSelectedObject}
            onCreateSceneObject={isPlaying ? undefined : createSceneObject}
            onUpdateSceneObject={isPlaying ? undefined : updateSceneObject}
            transformMode={transformMode}
            snapEnabled={snapEnabled}
          />
        </div>
        <div className="engine-viewport-play">
          <button
            className={isPlaying ? 'is-playing' : ''}
            title={isPlaying ? 'Stop game' : 'Play world'}
            onClick={() => setIsPlaying((playing) => !playing)}
          >
            {isPlaying ? (
              <Square size={13} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" />
            )}
          </button>
        </div>
      </section>

      <aside className="engine-panel engine-inspector" aria-label="Inspector">
        <div className="engine-panel-title">
          <span>
            <Braces size={15} /> Inspector
          </span>
        </div>
        <div className="engine-object-heading">
          <Box size={19} />
          <div>
            <strong>{selectedSceneObject?.name ?? selectedObject}</strong>
            <small>{selectedSceneObject?.kind ?? 'Scene object'}</small>
          </div>
        </div>
        {selectedSceneObject && (
          <div className="engine-inspector-group">
            <h3>Transform</h3>
            {(['x', 'y', 'z'] as const).map((axis, index) => (
              <NumberField
                key={axis}
                label={`Position ${axis.toUpperCase()}`}
                value={selectedSceneObject.position[index]}
                step={0.25}
                onChange={(value) => {
                  const position = [...selectedSceneObject.position] as [number, number, number]
                  position[index] = value
                  updateSceneObject(selectedSceneObject.id, { position })
                }}
              />
            ))}
            <NumberField
              label="Rotation Y"
              value={Math.round((selectedSceneObject.rotation[1] * 180) / Math.PI)}
              step={5}
              onChange={(value) =>
                updateSceneObject(selectedSceneObject.id, {
                  rotation: [
                    selectedSceneObject.rotation[0],
                    (value * Math.PI) / 180,
                    selectedSceneObject.rotation[2],
                  ],
                })
              }
            />
            <NumberField
              label="Scale"
              value={selectedSceneObject.scale[0]}
              min={0.1}
              step={0.1}
              onChange={(value) =>
                updateSceneObject(selectedSceneObject.id, { scale: [value, value, value] })
              }
            />
            {selectedSceneObject.light && (
              <LightFields
                settings={selectedSceneObject.light}
                onChange={(light) => updateSceneObject(selectedSceneObject.id, { light })}
              />
            )}
            {selectedSceneObject.grass && (
              <NumericSettingsFields
                fields={GRASS_FIELDS}
                settings={selectedSceneObject.grass}
                onChange={(grass) => updateSceneObject(selectedSceneObject.id, { grass })}
              />
            )}
            {selectedSceneObject.grassPlane && (
              <NumericSettingsFields
                fields={GRASS_PLANE_FIELDS}
                settings={selectedSceneObject.grassPlane}
                onChange={(grassPlane) => updateSceneObject(selectedSceneObject.id, { grassPlane })}
              />
            )}
            {selectedSceneObject.cave && (
              <NumericSettingsFields
                fields={CAVE_FIELDS}
                settings={selectedSceneObject.cave}
                onChange={(cave) => updateSceneObject(selectedSceneObject.id, { cave })}
              />
            )}
            {selectedSceneObject.mountain && (
              <NumericSettingsFields
                fields={MOUNTAIN_FIELDS}
                settings={selectedSceneObject.mountain}
                onChange={(mountain) => updateSceneObject(selectedSceneObject.id, { mountain })}
              />
            )}
            {selectedSceneObject.character && (
              <CharacterFields
                settings={selectedSceneObject.character}
                onChange={(character) => updateSceneObject(selectedSceneObject.id, { character })}
              />
            )}
            {selectedSceneObject.rock && (
              <NumericSettingsFields
                fields={ROCK_FIELDS}
                settings={selectedSceneObject.rock}
                onChange={(rock) => updateSceneObject(selectedSceneObject.id, { rock })}
              />
            )}
            {selectedSceneObject.pickup && (
              <PickupFields
                settings={selectedSceneObject.pickup}
                onChange={(pickup) => updateSceneObject(selectedSceneObject.id, { pickup })}
              />
            )}
            {selectedSceneObject.water && (
              <WaterFields
                settings={selectedSceneObject.water}
                onChange={(water) => updateSceneObject(selectedSceneObject.id, { water })}
              />
            )}
            {selectedSceneObject.path && (
              <NumericSettingsFields
                fields={PATH_FIELDS}
                settings={selectedSceneObject.path}
                onChange={(path) => updateSceneObject(selectedSceneObject.id, { path })}
              />
            )}
            {selectedSceneObject.ocean && (
              <NumericSettingsFields
                fields={OCEAN_FIELDS}
                settings={selectedSceneObject.ocean}
                onChange={(ocean) => updateSceneObject(selectedSceneObject.id, { ocean })}
              />
            )}
            {selectedSceneObject.house && (
              <NumericSettingsFields
                fields={HOUSE_FIELDS}
                settings={selectedSceneObject.house}
                onChange={(house) => updateSceneObject(selectedSceneObject.id, { house })}
              />
            )}
            {selectedSceneObject.tree && (
              <TreeFields
                settings={selectedSceneObject.tree}
                onChange={(tree) => updateSceneObject(selectedSceneObject.id, { tree })}
              />
            )}
            {!COLORLESS_KINDS.includes(selectedSceneObject.kind) && (
              <ColorField
                label={COLOR_LABELS[selectedSceneObject.kind] ?? 'Color'}
                value={selectedSceneObject.color}
                onChange={(color) => updateSceneObject(selectedSceneObject.id, { color })}
              />
            )}
            <label className="engine-switch">
              <span>Visible</span>
              <input
                type="checkbox"
                checked={selectedSceneObject.visible}
                onChange={(event) =>
                  updateSceneObject(selectedSceneObject.id, { visible: event.target.checked })
                }
              />
            </label>
            {!NON_DELETABLE_KINDS.includes(selectedSceneObject.kind) && (
              <button
                type="button"
                className="engine-delete-object"
                onClick={() => {
                  updateProject((current) => ({
                    ...current,
                    sceneObjects: current.sceneObjects.filter(
                      ({ id }) => id !== selectedSceneObject.id,
                    ),
                  }))
                  setSelectedObject('world')
                }}
              >
                <Trash2 size={14} /> Delete object
              </button>
            )}
          </div>
        )}
        <div className="engine-inspector-group">
          <h3>Debug</h3>
          <label className="engine-switch engine-switch-control">
            <span>
              <strong>Collision debug</strong>
              <small>Show physics shapes</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={project.debug.collisionShapes}
              onChange={(event) =>
                updateProject((current) => ({
                  ...current,
                  debug: { ...current.debug, collisionShapes: event.target.checked },
                }))
              }
            />
          </label>
        </div>
        <div className="engine-inspector-group">
          <h3>World settings</h3>
          <ColorField
            label="Background color"
            value={project.world.backgroundColor}
            onChange={(color) => updateWorld('backgroundColor', color)}
          />
          <NumberField
            label="Fog near"
            value={project.world.fogNear}
            min={0}
            onChange={(value) => updateWorld('fogNear', value)}
          />
          <NumberField
            label="Fog far"
            value={project.world.fogFar}
            min={1}
            onChange={(value) => updateWorld('fogFar', value)}
          />
        </div>
        <div className="engine-inspector-group">
          <h3>Procedural prototype</h3>
          <NumberField
            label="Seed"
            value={project.procedural.seed}
            min={0}
            onChange={(value) => updateProcedural('seed', value)}
          />
          <NumberField
            label="Props"
            value={project.procedural.count}
            min={SCENARIO_LIMITS.count.min}
            max={SCENARIO_LIMITS.count.max}
            onChange={(value) => updateProcedural('count', value)}
          />
          <NumberField
            label="Size"
            value={project.procedural.radius}
            min={SCENARIO_LIMITS.radius.min}
            max={SCENARIO_LIMITS.radius.max}
            onChange={(value) => updateProcedural('radius', value)}
          />
          <NumberField
            label="Relief"
            value={project.procedural.relief}
            min={SCENARIO_LIMITS.relief.min}
            max={SCENARIO_LIMITS.relief.max}
            onChange={(value) => updateProcedural('relief', value)}
          />
          <NumberField label="Grass per ground tile" value={project.procedural.groundGrassCount}
            min={SCENARIO_LIMITS.groundGrassCount.min} max={SCENARIO_LIMITS.groundGrassCount.max} step={100}
            onChange={value => updateProcedural('groundGrassCount', value)} />
          <NumberField label="Ground grass height" value={project.procedural.groundGrassHeight}
            min={SCENARIO_LIMITS.groundGrassHeight.min} max={SCENARIO_LIMITS.groundGrassHeight.max} step={0.01}
            onChange={value => updateProcedural('groundGrassHeight', value)} />
          <NumberField
            label="Items on ground"
            value={project.procedural.pickupCount}
            min={SCENARIO_LIMITS.pickupCount.min}
            max={SCENARIO_LIMITS.pickupCount.max}
            onChange={(value) => updateProcedural('pickupCount', value)}
          />
          <NumberField
            label="Villages"
            value={project.procedural.villageCount}
            min={SCENARIO_LIMITS.villageCount.min}
            max={SCENARIO_LIMITS.villageCount.max}
            onChange={(value) => updateProcedural('villageCount', value)}
          />
          <NumberField
            label="Houses per village"
            value={project.procedural.housesPerVillage}
            min={SCENARIO_LIMITS.housesPerVillage.min}
            max={SCENARIO_LIMITS.housesPerVillage.max}
            onChange={(value) => updateProcedural('housesPerVillage', value)}
          />
          <NumberField
            label="Forest trees"
            value={project.procedural.forestTreeCount}
            min={SCENARIO_LIMITS.forestTreeCount.min}
            max={SCENARIO_LIMITS.forestTreeCount.max}
            onChange={(value) => updateProcedural('forestTreeCount', value)}
          />
          <NumberField
            label="Medicinal plants"
            value={project.procedural.medicinalPlantCount}
            min={SCENARIO_LIMITS.medicinalPlantCount.min}
            max={SCENARIO_LIMITS.medicinalPlantCount.max}
            onChange={(value) => updateProcedural('medicinalPlantCount', value)}
          />
          <NumberField
            label="Lakes"
            value={project.procedural.lakeCount}
            min={SCENARIO_LIMITS.lakeCount.min}
            max={SCENARIO_LIMITS.lakeCount.max}
            onChange={(value) => updateProcedural('lakeCount', value)}
          />
          <NumberField
            label="Rivers"
            value={project.procedural.riverCount}
            min={SCENARIO_LIMITS.riverCount.min}
            max={SCENARIO_LIMITS.riverCount.max}
            onChange={(value) => updateProcedural('riverCount', value)}
          />
          <button type="button" className="engine-generate" onClick={generate}>
            <Sparkles size={15} /> Generate scenario
          </button>
          <p className="engine-hint">
            Nepal highland recipe: rural villages, varied forest, grassy hills, rivers,
            medicinal plants and distant non-colliding Himalayan peaks. Generating replaces every
            object except the character and lights, and builds the ground under the character.
          </p>
        </div>
      </aside>

      <section className="engine-flow-panel" aria-label="Game logic flow">
        <button className="engine-flow-heading" onClick={() => setGraphOpen((open) => !open)}>
          <span>
            <GitFork size={15} /> GAME FLOW{' '}
            <small>
              {nodes.length} nodes · {edges.length} links
            </small>
          </span>
          {graphOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {graphOpen && (
          <div className={`engine-flow-content ${selectedSceneObject ? 'has-properties' : ''}`}>
          <div className="engine-flow-canvas">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={(connection: Connection) =>
                  setEdges((current) => addEdge(connection, current))
                }
                fitView
                colorMode="dark"
              >
                <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#303740" />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable nodeColor="#d8a64d" maskColor="rgba(7, 9, 12, .76)" />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
          {selectedSceneObject && (
            <ObjectProperties
              object={selectedSceneObject}
              disabled={isPlaying}
              onChange={(properties) => updateSceneObject(selectedSceneObject.id, { properties })}
            />
          )}
          </div>
        )}
      </section>
    </main>
  )
}
