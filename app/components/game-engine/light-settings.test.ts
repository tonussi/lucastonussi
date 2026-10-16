import assert from 'node:assert/strict'
import test from 'node:test'
import { clampLightSettings, LIGHT_LIMITS } from './light-settings.ts'
import { normalizeProject, serializeProject } from './project-model.ts'
import { defaultEngineProject, type EngineSceneObject } from './types.ts'

test('light settings are clamped and invalid types fall back to point', () => {
  const clamped = clampLightSettings({ lightType: 'laser' as never, intensity: 1e6, distance: -5, angle: Number.NaN })
  assert.equal(clamped.lightType, 'point')
  assert.equal(clamped.intensity, LIGHT_LIMITS.intensity.max)
  assert.equal(clamped.distance, LIGHT_LIMITS.distance.min)
  assert.equal(clamped.angle, LIGHT_LIMITS.angle.min)
})

test('light objects round-trip and legacy lights receive default settings', () => {
  const light: EngineSceneObject = {
    id: 'light-1',
    name: 'Light 1',
    kind: 'light',
    position: [1, 3, 1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: '#ffe9a8',
    visible: true,
    light: { lightType: 'spot', intensity: 60, distance: 30, angle: 30, orbitRadius: 4, orbitSpeed: -90 },
    properties: {},
  }
  const restored = normalizeProject(JSON.parse(serializeProject({ ...defaultEngineProject, sceneObjects: [light] })))
  assert.deepEqual(restored.sceneObjects[0].light, light.light)
  const legacy = normalizeProject({ ...defaultEngineProject, sceneObjects: [{ ...light, light: undefined }] })
  assert.equal(legacy.sceneObjects[0].light?.lightType, 'point')
})

test('directional and ambient light types are preserved by clamping', () => {
  assert.equal(clampLightSettings({ lightType: 'directional' }).lightType, 'directional')
  assert.equal(clampLightSettings({ lightType: 'ambient' }).lightType, 'ambient')
})

test('light orbit radius and speed are clamped and default to a still light', () => {
  const clamped = clampLightSettings({ orbitRadius: 1e6, orbitSpeed: -1e6 })
  assert.equal(clamped.orbitRadius, LIGHT_LIMITS.orbitRadius.max)
  assert.equal(clamped.orbitSpeed, LIGHT_LIMITS.orbitSpeed.min)
  assert.equal(clampLightSettings({}).orbitRadius, 0)
})
