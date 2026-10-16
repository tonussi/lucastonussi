export const ROLL_FADE_RATIO = 0.1

export function rollSpeedFor(distance: number, duration: number) {
  return distance / duration
}

export function rollFadeSeconds(defaultFade: number, rollDuration: number) {
  return Math.min(defaultFade, rollDuration * ROLL_FADE_RATIO)
}
