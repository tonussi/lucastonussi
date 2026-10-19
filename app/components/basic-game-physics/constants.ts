export const GRAVITY = -9.8
export const CHARACTER_GRAVITY_SCALE = 2.5
export const CHARACTER_FRICTION = 0
/** Foot capsule of the character body: half height, radius and vertical offset from the body origin. */
export const CHARACTER_FOOT_CAPSULE = { halfHeight: 0.08, radius: 0.5, offsetY: 0.1 } as const
/** Distance from the body origin down to the soles. */
export const CHARACTER_FOOT_DEPTH = CHARACTER_FOOT_CAPSULE.halfHeight + CHARACTER_FOOT_CAPSULE.radius - CHARACTER_FOOT_CAPSULE.offsetY
