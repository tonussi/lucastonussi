import { useEffect, useRef, useState } from 'react'

// Xbox controller mapping (standard)
const DEADZONE = 0.15
const TRIGGER_DEADZONE = 0.1

export type GamepadState = {
  connected: boolean
  leftStickX: number // -1..1
  leftStickY: number // -1..1 (up = -1)
  rightStickX: number
  rightStickY: number
  leftTrigger: number // 0..1
  rightTrigger: number // 0..1
  a: boolean
  b: boolean
  x: boolean
  y: boolean
  lb: boolean
  rb: boolean
}

const emptyState: GamepadState = {
  connected: false,
  leftStickX: 0,
  leftStickY: 0,
  rightStickX: 0,
  rightStickY: 0,
  leftTrigger: 0,
  rightTrigger: 0,
  a: false,
  b: false,
  x: false,
  y: false,
  lb: false,
  rb: false,
}

const applyDeadzone = (v: number, dz = DEADZONE) => {
  if (Math.abs(v) < dz) return 0
  // Re-scale so deadzone edges map to 0 and full range to 1
  const sign = Math.sign(v)
  const mag = (Math.abs(v) - dz) / (1 - dz)
  return sign * Math.min(1, mag)
}

// Polls the Gamepad API at ~60fps and exposes a normalized Xbox-style state.
const useGamepad = () => {
  const [state, setState] = useState<GamepadState>(emptyState)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      const pad = pads ? Array.from(pads).find((p) => p && p.connected) : null

      if (!pad) {
        setState((s) => (s.connected ? emptyState : s))
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const next: GamepadState = {
        connected: true,
        leftStickX: applyDeadzone(pad.axes[0] ?? 0),
        leftStickY: applyDeadzone(pad.axes[1] ?? 0),
        rightStickX: applyDeadzone(pad.axes[2] ?? 0),
        rightStickY: applyDeadzone(pad.axes[3] ?? 0),
        leftTrigger: (pad.buttons[6]?.value ?? 0) > TRIGGER_DEADZONE ? pad.buttons[6].value : 0,
        rightTrigger: (pad.buttons[7]?.value ?? 0) > TRIGGER_DEADZONE ? pad.buttons[7].value : 0,
        a: !!(pad.buttons[0]?.pressed),
        b: !!(pad.buttons[1]?.pressed),
        x: !!(pad.buttons[2]?.pressed),
        y: !!(pad.buttons[3]?.pressed),
        lb: !!(pad.buttons[4]?.pressed),
        rb: !!(pad.buttons[5]?.pressed),
      }
      setState(next)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return state
}

export default useGamepad
