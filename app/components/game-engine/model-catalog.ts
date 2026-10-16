import type { CharacterState } from './character-settings.ts'

export type ModelColliderKind = 'none' | 'trimesh'

export type ModelRole = 'prop' | 'character'

export interface CatalogModel {
  label: string
  role: ModelRole
  /** Animation clip names stored in the GLB; used to map character states. */
  clips: string[]
  /** Extra GLBs whose animation clips are applied to this model (same skeleton). */
  animationUrls?: string[]
  /** Clips preferred for each character state before name matching. */
  defaultClips?: Partial<Record<CharacterState, string>>
  url: string
  defaultCollider: ModelColliderKind
  baseScale: number
  baseOffset: [number, number, number]
  baseYaw: number
  sway: boolean
}

const UNIVERSAL_ANIMATION_URL = '/assets/consolidated/animations/universal-animation/Unreal-Godot/UAL1_Standard.glb'
const UNIVERSAL_ANIMATION_CLIPS = [
  'A_TPose',
  'Crouch_Fwd_Loop',
  'Crouch_Idle_Loop',
  'Dance_Loop',
  'Death01',
  'Driving_Loop',
  'Fixing_Kneeling',
  'Hit_Chest',
  'Hit_Head',
  'Idle_Loop',
  'Idle_Talking_Loop',
  'Idle_Torch_Loop',
  'Interact',
  'Jog_Fwd_Loop',
  'Jump_Land',
  'Jump_Loop',
  'Jump_Start',
  'PickUp_Table',
  'Pistol_Aim_Down',
  'Pistol_Aim_Neutral',
  'Pistol_Aim_Up',
  'Pistol_Idle_Loop',
  'Pistol_Reload',
  'Pistol_Shoot',
  'Punch_Cross',
  'Punch_Jab',
  'Push_Loop',
  'Roll',
  'Sitting_Enter',
  'Sitting_Exit',
  'Sitting_Idle_Loop',
  'Sitting_Talking_Loop',
  'Spell_Simple_Enter',
  'Spell_Simple_Exit',
  'Spell_Simple_Idle_Loop',
  'Spell_Simple_Shoot',
  'Sprint_Loop',
  'Swim_Fwd_Loop',
  'Swim_Idle_Loop',
  'Sword_Attack',
  'Sword_Idle',
  'Walk_Formal_Loop',
  'Walk_Loop',
]

export const DEFAULT_CHARACTER_MODEL_ID = 'male-ranger'

export const MODEL_CATALOG: Record<string, CatalogModel> = {
  [DEFAULT_CHARACTER_MODEL_ID]: {
    label: 'Male Ranger',
    role: 'character',
    clips: UNIVERSAL_ANIMATION_CLIPS,
    animationUrls: [UNIVERSAL_ANIMATION_URL],
    defaultClips: {
      idle: 'Idle_Loop',
      moving: 'Jog_Fwd_Loop',
      rolling: 'Roll',
      jumping: 'Jump_Start',
      falling: 'Jump_Loop',
    },
    url: '/assets/consolidated/characters/male-ranger/Male_Ranger.gltf',
    defaultCollider: 'none',
    baseScale: 1,
    baseOffset: [0, -0.25, 0],
    baseYaw: 0,
    sway: false,
  },
  'skeleton-pirate': {
    label: 'Skeleton Pirate',
    role: 'character',
    clips: ['Armature|DefaultSkeletonPose', 'Armature|RunningAtPlayerAnimation'],
    defaultClips: { idle: 'Armature|DefaultSkeletonPose', moving: 'Armature|RunningAtPlayerAnimation' },
    url: '/assets/consolidated/characters/skeleton-pirate/pirate.glb',
    defaultCollider: 'none',
    baseScale: 0.00088,
    baseOffset: [0, -0.25, 0],
    baseYaw: 0,
    sway: false,
  },
  'pirate-ship': {
    label: 'Pirate Ship',
    role: 'prop',
    clips: [],
    url: '/assets/consolidated/props/pirate-ship/pirate_ship.glb',
    defaultCollider: 'trimesh',
    baseScale: 0.00113,
    baseOffset: [0, 0.15, 0],
    baseYaw: Math.PI / 2,
    sway: true,
  },
  rabbit: {
    label: 'Rabbit',
    role: 'prop',
    clips: [],
    url: '/assets/consolidated/props/rabbit/rabbit.glb',
    defaultCollider: 'none',
    baseScale: 1,
    baseOffset: [0, 0.5, 0],
    baseYaw: 0,
    sway: false,
  },
}

export const CHARACTER_MODEL_IDS = Object.keys(MODEL_CATALOG).filter(
  (modelId) => MODEL_CATALOG[modelId].role === 'character',
)

export const MODEL_COLLIDERS: ModelColliderKind[] = ['none', 'trimesh']
