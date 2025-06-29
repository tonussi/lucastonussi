import { Fullscreen } from 'lucide-react'
import { useRef, useState } from 'react'

interface SavedProps {
  height: string
  width: string
  position: string
  top: string
  left: string
  zIndex: string
  overflow: string
  margin: string
  padding: string
  borderRadius: string
}

interface FullscreenWrapperProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

function FullscreenWrapper({ children, className = '', ...props }: FullscreenWrapperProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null!)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedProps, setSavedProps] = useState<SavedProps>({} as SavedProps)

  return (
    <div ref={gameContainerRef} className={`rounded-lg overflow-hidden ${className}`} {...props}>
      <Fullscreen
        size={24}
        className="absolute top-4 right-4 z-10"
        onClick={() => {
          if (isFullscreen) {
            setIsFullscreen(false)
            setSavedProps({
              height: gameContainerRef.current.style.height,
              width: gameContainerRef.current.style.width,
              position: gameContainerRef.current.style.position,
              top: gameContainerRef.current.style.top,
              left: gameContainerRef.current.style.left,
              zIndex: gameContainerRef.current.style.zIndex,
              overflow: gameContainerRef.current.style.overflow,
              margin: gameContainerRef.current.style.margin,
              padding: gameContainerRef.current.style.padding,
              borderRadius: gameContainerRef.current.style.borderRadius,
            })
            if (gameContainerRef.current) {
              gameContainerRef.current.style.height = '100vh'
              gameContainerRef.current.style.width = '100vw'
              gameContainerRef.current.style.position = 'fixed'
              gameContainerRef.current.style.top = '0'
              gameContainerRef.current.style.left = '0'
              gameContainerRef.current.style.zIndex = '1000'
              gameContainerRef.current.style.overflow = 'hidden'
              gameContainerRef.current.style.margin = '0'
              gameContainerRef.current.style.padding = '0'
              gameContainerRef.current.style.borderRadius = '0px'
            }
          } else {
            setIsFullscreen(true)
            if (gameContainerRef.current) {
              gameContainerRef.current.style.height = savedProps.height
              gameContainerRef.current.style.width = savedProps.width
              gameContainerRef.current.style.position = savedProps.position
              gameContainerRef.current.style.top = savedProps.top
              gameContainerRef.current.style.left = savedProps.left
              gameContainerRef.current.style.zIndex = savedProps.zIndex
              gameContainerRef.current.style.overflow = savedProps.overflow
              gameContainerRef.current.style.margin = savedProps.margin
              gameContainerRef.current.style.padding = savedProps.padding
              gameContainerRef.current.style.borderRadius = savedProps.borderRadius
            }
          }
        }}
      />
      {children}
    </div>
  )
}

export default FullscreenWrapper
