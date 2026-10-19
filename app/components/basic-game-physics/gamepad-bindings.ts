import type { GamepadState } from './gamepad'

type GamepadButton = {
  [Key in keyof GamepadState]: GamepadState[Key] extends boolean ? Key : never
}[keyof GamepadState]

/**
 * Layout modelled on the Elden Ring controller screen. B is shared: a tap rolls (only while
 * moving, a tap while standing does nothing) and holding it runs. Start opens the inventory and Select
 * the character sheet. The D-pad cycles the quick-slot categories.
 */
export const GAMEPAD_BINDINGS = {
  dodge: 'b',
  jump: 'a',
  guard: 'lb',
  skill: 'r3',
  attack: 'rb',
  strongAttack: 'rt',
  interact: 'y',
  useItem: 'x',
  /** Toggles first-person view. */
  toggleView: 'lt',
} as const satisfies Record<string, GamepadButton>
