import { useEffect, useRef } from 'react'

export function useButtonEdge(pressed: boolean, onPress: () => void) {
  const wasPressed = useRef(false)
  const handler = useRef(onPress)
  handler.current = onPress

  useEffect(() => {
    if (pressed && !wasPressed.current) handler.current()
    wasPressed.current = pressed
  }, [pressed])
}
