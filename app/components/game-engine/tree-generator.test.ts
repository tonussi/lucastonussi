import assert from 'node:assert/strict'
import test from 'node:test'
import { clampTreeSettings, generateTree, TREE_LIMITS } from './tree-generator.ts'
import { normalizeProject, serializeProject } from './project-model.ts'
import { defaultEngineProject, type EngineSceneObject } from './types.ts'

test('tree generation honors requested height, branch count and leaf count', () => {
  const tree = generateTree({ height: 6, branchCount: 5, leafCount: 40, seed: 7 })
  assert.equal(tree.branches.length, 5)
  assert.equal(tree.leaves.length, 40)
  assert.equal(tree.trunk.end[1], 6)
})

test('tree generation is deterministic per seed and differs across seeds', () => {
  const settings = { height: 4, branchCount: 6, leafCount: 30 }
  assert.deepEqual(generateTree({ ...settings, seed: 3 }), generateTree({ ...settings, seed: 3 }))
  assert.notDeepEqual(generateTree({ ...settings, seed: 3 }), generateTree({ ...settings, seed: 4 }))
})

test('tree settings are clamped to safe limits', () => {
  const clamped = clampTreeSettings({ height: 999, branchCount: -3, leafCount: 1e6, seed: 1.4 })
  assert.equal(clamped.height, TREE_LIMITS.height.max)
  assert.equal(clamped.branchCount, TREE_LIMITS.branchCount.min)
  assert.equal(clamped.leafCount, TREE_LIMITS.leafCount.max)
  assert.equal(clamped.seed, 1)
})

test('tree objects round-trip through the serialized project and legacy trees get defaults', () => {
  const tree: EngineSceneObject = {
    id: 'tree-1',
    name: 'Tree 1',
    kind: 'tree',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: '#4f9a45',
    visible: true,
    tree: { height: 5, branchCount: 9, leafCount: 80, seed: 11 },
    properties: {},
  }
  const restored = normalizeProject(JSON.parse(serializeProject({ ...defaultEngineProject, sceneObjects: [tree] })))
  assert.deepEqual(restored.sceneObjects[0].tree, tree.tree)
  const legacy = normalizeProject({ ...defaultEngineProject, sceneObjects: [{ ...tree, tree: undefined }] })
  assert.ok(legacy.sceneObjects[0].tree)
})
