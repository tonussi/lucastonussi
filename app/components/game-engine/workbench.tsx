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
  Move3d,
  Play,
  Plus,
  RotateCcw,
  Rotate3d,
  Save,
  Scaling,
  Square,
  Sparkles,
  Trash2,
  TreePine,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import BasicGamePhysics from '@/components/basic-game-physics/world'
import {
  defaultEngineProject,
  type EngineProject,
  type EngineSceneObject,
  type GenerationRecord,
  type SceneObjectKind,
  type TreeSettings,
  type JsonObject,
} from './types'
import { DEFAULT_TREE_SETTINGS, TREE_LIMITS } from './tree-generator'
import {
  ENGINE_PROJECT_STORAGE_KEY,
  normalizeProject,
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
    return normalizeProject(JSON.parse(saved) as Partial<EngineProject>)
  } catch {
    return defaultEngineProject
  }
}

const OBJECT_KINDS: SceneObjectKind[] = ['cube', 'sphere', 'tree']

const OBJECT_DEFAULTS: Record<SceneObjectKind, { label: string; color: string }> = {
  cube: { label: 'Cube', color: '#d8a64d' },
  sphere: { label: 'Sphere', color: '#5d9dd6' },
  tree: { label: 'Tree', color: '#4f9a45' },
}

const SEED_RANGE = 100000

function ObjectKindIcon({ kind, size }: { kind: SceneObjectKind; size: number }) {
  if (kind === 'sphere') return <Circle size={size} />
  if (kind === 'tree') return <TreePine size={size} />
  return <Box size={size} />
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
      <NumberField label="Tree seed" value={settings.seed} step={1} onChange={(value) => update('seed', value)} />
      <button type="button" onClick={() => update('seed', Math.floor(Math.random() * SEED_RANGE))}>
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
          const parsed = normalizeProject(JSON.parse(String(reader.result)) as EngineProject)
          if (parsed.schemaVersion !== 1 || !parsed.world || !parsed.flow) throw new Error()
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
    const record: GenerationRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      seed: project.procedural.seed,
      count: project.procedural.count,
      radius: project.procedural.radius,
    }
    updateProject((current) => ({
      ...current,
      procedural: { ...current.procedural, seed: current.procedural.seed + 1 },
      generations: [record, ...current.generations].slice(0, 20),
    }))
  }, [project.procedural, updateProject])

  const updateWorld = (key: keyof EngineProject['world'], value: number) =>
    updateProject((current) => ({ ...current, world: { ...current.world, [key]: value } }))

  const updateProcedural = (key: keyof EngineProject['procedural'], value: number | boolean) =>
    updateProject((current) => ({
      ...current,
      procedural: { ...current.procedural, [key]: value },
    }))

  const createSceneObject = (kind: SceneObjectKind, position: [number, number, number]) => {
    const sameKindCount = project.sceneObjects.filter((object) => object.kind === kind).length
    const object: EngineSceneObject = {
      id: crypto.randomUUID(),
      name: `${OBJECT_DEFAULTS[kind].label} ${sameKindCount + 1}`,
      kind,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: OBJECT_DEFAULTS[kind].color,
      visible: true,
      ...(kind === 'tree' && {
        tree: { ...DEFAULT_TREE_SETTINGS, seed: Math.floor(Math.random() * SEED_RANGE) },
      }),
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
          {OBJECT_KINDS.map((kind) => (
            <button
              key={kind}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-world-object', kind)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onDoubleClick={() => createSceneObject(kind, [0, -9.35, 0])}
              title={`Drag ${kind} into the viewport`}
            >
              <ObjectKindIcon kind={kind} size={16} />
              <span>{kind}</span>
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
        {['Character', 'Physics Playground', 'Ocean', 'Pirate Ship'].map((name) => (
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
          </div>
        )}
        <div className="engine-world-frame">
          <BasicGamePhysics
            worldSettings={project.world}
            proceduralSettings={project.procedural}
            editorMode
            isPlaying={isPlaying}
            debugColliders={project.debug.collisionShapes}
            sceneObjects={project.sceneObjects}
            selectedSceneObjectId={selectedSceneObject?.id}
            onSelectSceneObject={isPlaying ? undefined : setSelectedObject}
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
            {selectedSceneObject.tree && (
              <TreeFields
                settings={selectedSceneObject.tree}
                onChange={(tree) => updateSceneObject(selectedSceneObject.id, { tree })}
              />
            )}
            <label className="engine-field">
              <span>{selectedSceneObject.kind === 'tree' ? 'Leaf color' : 'Color'}</span>
              <input
                type="color"
                value={selectedSceneObject.color}
                onChange={(event) =>
                  updateSceneObject(selectedSceneObject.id, { color: event.target.value })
                }
              />
            </label>
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
          <NumberField
            label="Ocean Y"
            value={project.world.oceanLevel}
            step={0.1}
            onChange={(value) => updateWorld('oceanLevel', value)}
          />
          <NumberField
            label="Ship Y"
            value={project.world.shipHeight}
            step={0.1}
            onChange={(value) => updateWorld('shipHeight', value)}
          />
          <NumberField
            label="Ship scale"
            value={project.world.shipScale}
            min={0.1}
            step={0.1}
            onChange={(value) => updateWorld('shipScale', value)}
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
          <label className="engine-switch">
            <span>Render markers</span>
            <input
              type="checkbox"
              checked={project.procedural.enabled}
              onChange={(event) => updateProcedural('enabled', event.target.checked)}
            />
          </label>
          <NumberField
            label="Seed"
            value={project.procedural.seed}
            min={0}
            onChange={(value) => updateProcedural('seed', value)}
          />
          <NumberField
            label="Count"
            value={project.procedural.count}
            min={0}
            max={80}
            onChange={(value) => updateProcedural('count', value)}
          />
          <NumberField
            label="Radius"
            value={project.procedural.radius}
            min={2}
            max={40}
            onChange={(value) => updateProcedural('radius', value)}
          />
          <button type="button" className="engine-generate" onClick={generate}>
            <Sparkles size={15} /> Generate snapshot
          </button>
          <p className="engine-hint">
            A neutral seeded scatter for now. The recipe can later become terrain, rooms, islands or
            encounters without changing the JSON contract.
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
