import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { rollFadeSeconds } from '../game-engine/roll'
import { SkeletonUtils } from 'three-stdlib'
import { CHARACTER_STATES, resolveClipName, type CharacterState } from '../game-engine/character-settings'
import { MODEL_CATALOG } from '../game-engine/model-catalog'
import type { CharacterSettings } from '../game-engine/types'

interface PlayerCharacterProps {
  settings: CharacterSettings
  state: CharacterState
}

export default function PlayerCharacter({ settings, state }: PlayerCharacterProps) {
  const { url, animationUrls = [], defaultClips, baseScale, baseOffset, baseYaw } = MODEL_CATALOG[settings.modelId]
  const group = useRef<THREE.Group>(null!)
  const [{ scene, animations: ownAnimations }, ...animationSources] = useGLTF([url, ...animationUrls])
  const animations = useMemo(
    () => [...ownAnimations, ...animationSources.flatMap((source) => source.animations)],
    [ownAnimations, ...animationSources],
  )
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions, names } = useAnimations(animations, group)
  const { field, loop } = CHARACTER_STATES.find((entry) => entry.state === state)!
  const clipName = resolveClipName(names, state, settings[field], defaultClips?.[state])

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [model])

  useEffect(() => {
    const action = clipName ? actions[clipName] : undefined
    action?.reset().setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
    if (action) {
      action.clampWhenFinished = true
      action.setEffectiveTimeScale(state === 'rolling' ? action.getClip().duration / settings.rollDuration : state === 'interacting' ? action.getClip().duration / settings.actions.interact.duration : 1)
    }
    const fadeSeconds = state === 'rolling' ? rollFadeSeconds(settings.animationFade, settings.rollDuration) : settings.animationFade
    action?.fadeIn(fadeSeconds).play()
    return () => {
      action?.fadeOut(fadeSeconds)
    }
  }, [actions, clipName, loop, state, settings.rollDuration, settings.animationFade, settings.actions.interact.duration])

  return (
    <group ref={group} dispose={null}>
      <primitive object={model} position={baseOffset} rotation-y={baseYaw} scale={baseScale} />
    </group>
  )
}

Object.values(MODEL_CATALOG)
  .filter(({ role }) => role === 'character')
  .forEach(({ url, animationUrls = [] }) => [url, ...animationUrls].forEach((source) => useGLTF.preload(source)))
