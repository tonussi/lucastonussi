import { useEffect, useState } from 'react'

// Custom hook for handling keyboard and mouse input
const useInputHandler = () => {
  const [keysPressed, setKeysPressed] = useState<{
    w: boolean
    a: boolean
    s: boolean
    d: boolean
    space: boolean
  }>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  })

  const [mouse, setMouse] = useState<{
    x: number
    y: number
    isLeft: boolean
    isMiddle: boolean
    isRight: boolean
  }>({
    x: 0,
    y: 0,
    isLeft: false,
    isMiddle: false,
    isRight: false,
  })

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
        isLeft: event.buttons === 1,
        isRight: event.buttons === 2,
        isMiddle: event.buttons === 4,
      })
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mousedown', handleMouse)
    window.addEventListener('mouseup', handleMouse)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mousedown', handleMouse)
      window.removeEventListener('mouseup', handleMouse)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => ({
        ...prevKeys,
        [event.code.toLowerCase().replace('key', '')]: true,
      }))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => ({
        ...prevKeys,
        [event.code.toLowerCase().replace('key', '')]: false,
      }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return { keysPressed, mouse }
}

export default useInputHandler
