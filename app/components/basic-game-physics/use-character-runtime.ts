import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  advanceResources,
  canSprint,
  createRuntimeState,
  cycleQuickSlot,
  pickUpItem,
  spendAttributePoint,
  spendResource,
  consumeSelectedItem,
  type CharacterRuntimeState,
} from '../game-engine/character-runtime'
import { QUICK_SLOT_CATEGORIES, type DpadDirection } from '../game-engine/quick-slots'
import type { CharacterSettings } from '../game-engine/types'
import type { GamepadState } from './gamepad'

const HUD_REFRESH_MS = 100

const DPAD_BUTTON: Record<DpadDirection, keyof GamepadState> = {
  up: 'dpadUp',
  down: 'dpadDown',
  left: 'dpadLeft',
  right: 'dpadRight',
}

export interface CharacterRuntime {
  state: CharacterRuntimeState
  tick: (deltaSeconds: number, sprinting: boolean) => void
  canSprint: () => boolean
  spendPoint: (attributeId: string) => void
  /** Spends a resource; returns false and changes nothing when there is not enough. */
  trySpend: (resourceId: string, amount: number) => boolean
  /** Uses the selected consumable; returns false when nothing could be used. */
  consumeItem: () => boolean
  pickUp: (pickupId: string, itemId: string, quantity: number) => void
}

export function useCharacterRuntime(settings: CharacterSettings, gamepad: GamepadState, enabled: boolean): CharacterRuntime {
  const store = useRef<CharacterRuntimeState>(createRuntimeState(settings))
  const [, refresh] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    store.current = createRuntimeState(settings)
    refresh()
  }, [settings.attributes, settings.unspentPoints, settings.loadout])

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(refresh, HUD_REFRESH_MS)
    return () => clearInterval(interval)
  }, [enabled])

  const dpadWasPressed = useRef<Record<DpadDirection, boolean>>({ up: false, down: false, left: false, right: false })
  useEffect(() => {
    QUICK_SLOT_CATEGORIES.forEach(({ id, dpad }) => {
      const pressed = Boolean(gamepad[DPAD_BUTTON[dpad]])
      if (enabled && pressed && !dpadWasPressed.current[dpad]) {
        store.current = cycleQuickSlot(store.current, id, store.current.quickSlots[id]?.length ?? 0)
        refresh()
      }
      dpadWasPressed.current[dpad] = pressed
    })
  }, [enabled, gamepad])

  const tick = useCallback((deltaSeconds: number, sprinting: boolean) => {
    store.current = advanceResources(store.current, deltaSeconds, sprinting)
  }, [])
  const spendPoint = useCallback((attributeId: string) => {
    store.current = spendAttributePoint(store.current, attributeId)
    refresh()
  }, [])

  const trySpend = useCallback((resourceId: string, amount: number) => {
    const next = spendResource(store.current, resourceId, amount)
    if (!next) return false
    store.current = next
    return true
  }, [])
  const consumeItem = useCallback(() => {
    const next = consumeSelectedItem(store.current)
    if (!next) return false
    store.current = next
    refresh()
    return true
  }, [])
  const pickUp = useCallback((pickupId: string, itemId: string, quantity: number) => {
    store.current = pickUpItem(store.current, pickupId, itemId, quantity)
    refresh()
  }, [])

  return { state: store.current, tick, canSprint: () => canSprint(store.current), spendPoint, trySpend, consumeItem, pickUp }
}
