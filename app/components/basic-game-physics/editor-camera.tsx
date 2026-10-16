import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'])

export default function EditorCamera() {
  const controls = useRef<any>(null)
  const pressed = useRef(new Set<string>())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const movement = useRef(new THREE.Vector3())

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (MOVE_KEYS.has(event.code)) pressed.current.add(event.code)
    }
    const handleKeyUp = (event: KeyboardEvent) => pressed.current.delete(event.code)
    const clearKeys = () => pressed.current.clear()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', clearKeys)
    }
  }, [])

  useFrame(({ camera }, delta) => {
    if (!controls.current) return

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, camera.up).normalize()
    movement.current.set(0, 0, 0)

    if (pressed.current.has('KeyW')) movement.current.add(forward.current)
    if (pressed.current.has('KeyS')) movement.current.sub(forward.current)
    if (pressed.current.has('KeyA')) movement.current.sub(right.current)
    if (pressed.current.has('KeyD')) movement.current.add(right.current)

    if (movement.current.lengthSq() > 0) {
      const speed = pressed.current.has('ShiftLeft') || pressed.current.has('ShiftRight') ? 22 : 9
      movement.current.normalize().multiplyScalar(speed * delta)
      camera.position.add(movement.current)
      controls.current.target.add(movement.current)
      controls.current.update()
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[14, 9, 14]} fov={58} near={0.1} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, -5, 0]}
        enableDamping
        dampingFactor={0.08}
        enablePan
        enableRotate
        enableZoom
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  )
}
