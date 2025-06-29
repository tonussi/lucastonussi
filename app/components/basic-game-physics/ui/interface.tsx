import { useEffect, useState } from 'react'

interface GameInterfaceProps {
  onKeyPress?: (key: string) => void
  onMouseClick?: () => void
}

const GameInterface = ({ onKeyPress, onMouseClick }: GameInterfaceProps) => {
  const [keysPressed, setKeysPressed] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeysPressed((prev) => ({ ...prev, [key]: true }))
        onKeyPress?.(key)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeysPressed((prev) => ({ ...prev, [key]: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onKeyPress])

  const handleMouseClick = () => {
    onMouseClick?.()
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center gap-2">
        {/* W key */}
        <button
          className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-colors ${
            keysPressed.w
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
          }`}
          onMouseDown={() => {
            setKeysPressed((prev) => ({ ...prev, w: true }))
            onKeyPress?.('w')
          }}
          onMouseUp={() => setKeysPressed((prev) => ({ ...prev, w: false }))}
          onTouchStart={() => {
            setKeysPressed((prev) => ({ ...prev, w: true }))
            onKeyPress?.('w')
          }}
          onTouchEnd={() => setKeysPressed((prev) => ({ ...prev, w: false }))}
        >
          W
        </button>

        {/* A S D row */}
        <div className="flex gap-2">
          <button
            className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-colors ${
              keysPressed.a
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
            }`}
            onMouseDown={() => {
              setKeysPressed((prev) => ({ ...prev, a: true }))
              onKeyPress?.('a')
            }}
            onMouseUp={() => setKeysPressed((prev) => ({ ...prev, a: false }))}
            onTouchStart={() => {
              setKeysPressed((prev) => ({ ...prev, a: true }))
              onKeyPress?.('a')
            }}
            onTouchEnd={() => setKeysPressed((prev) => ({ ...prev, a: false }))}
          >
            A
          </button>

          <button
            className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-colors ${
              keysPressed.s
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
            }`}
            onMouseDown={() => {
              setKeysPressed((prev) => ({ ...prev, s: true }))
              onKeyPress?.('s')
            }}
            onMouseUp={() => setKeysPressed((prev) => ({ ...prev, s: false }))}
            onTouchStart={() => {
              setKeysPressed((prev) => ({ ...prev, s: true }))
              onKeyPress?.('s')
            }}
            onTouchEnd={() => setKeysPressed((prev) => ({ ...prev, s: false }))}
          >
            S
          </button>

          <button
            className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-colors ${
              keysPressed.d
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
            }`}
            onMouseDown={() => {
              setKeysPressed((prev) => ({ ...prev, d: true }))
              onKeyPress?.('d')
            }}
            onMouseUp={() => setKeysPressed((prev) => ({ ...prev, d: false }))}
            onTouchStart={() => {
              setKeysPressed((prev) => ({ ...prev, d: true }))
              onKeyPress?.('d')
            }}
            onTouchEnd={() => setKeysPressed((prev) => ({ ...prev, d: false }))}
          >
            D
          </button>
        </div>

        {/* Mouse click button */}
        <button
          className="w-16 h-12 rounded-lg border-2 font-bold text-lg bg-red-200 text-red-700 border-red-300 hover:bg-red-300 transition-colors"
          onClick={handleMouseClick}
        >
          🔫
        </button>
      </div>
    </div>
  )
}

export default GameInterface
