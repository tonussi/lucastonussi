export interface DodgeInput {
  /** Seconds the button has been held, 0 when released. */
  held: number
  /** True on the frame the button was released before the hold threshold. */
  tapped: boolean
  /** True while the button has been held long enough to run. */
  dashing: boolean
}

export function readDodgeInput(wasDown: boolean, isDown: boolean, heldBefore: number, deltaSeconds: number, holdSeconds: number): DodgeInput {
  const held = isDown ? heldBefore + deltaSeconds : 0
  return {
    held,
    tapped: wasDown && !isDown && heldBefore < holdSeconds,
    dashing: isDown && held >= holdSeconds,
  }
}
