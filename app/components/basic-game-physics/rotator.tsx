import { useFrame } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Group } from 'three'

function Rotator({ children }: { children: ReactNode }) {
  const groupRef = useRef<Group>(null!)

  useFrame(() => {
    groupRef.current.children.forEach((child) => {
      if (child.isObject3D) {
        child.rotateX(0.02)
        child.rotateY(0.02)
      }
    })
  })

  return <group ref={groupRef}>{children}</group>
}

export default Rotator
