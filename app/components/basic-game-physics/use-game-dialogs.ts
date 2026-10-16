import { useCallback, useEffect, useState } from 'react'
import type { GamepadState } from './gamepad'
import { useButtonEdge } from './use-button-edge'

export type GameDialog = 'inventory' | 'stats'

const DIALOG_KEYS: Record<string, GameDialog> = { KeyI: 'inventory', KeyC: 'stats' }
const CLOSE_KEY = 'Escape'

export function useGameDialogs(enabled: boolean, gamepad: GamepadState) {
  const [active, setActive] = useState<GameDialog | null>(null)
  const close = useCallback(() => setActive(null), [])
  const toggle = useCallback(
    (dialog: GameDialog) => enabled && setActive((current) => (current === dialog ? null : dialog)),
    [enabled],
  )

  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code === CLOSE_KEY) setActive(null)
      const dialog = DIALOG_KEYS[event.code]
      if (dialog) toggle(dialog)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, toggle])

  useButtonEdge(gamepad.start, () => toggle('inventory'))
  useButtonEdge(gamepad.select, () => toggle('stats'))

  useEffect(() => {
    if (!enabled) setActive(null)
  }, [enabled])

  return { active, close }
}
