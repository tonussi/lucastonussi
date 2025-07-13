import { useFrame } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import { Group } from 'three'

function Mover({ children, moviment }: { children: ReactNode; moviment: THREE.Vector3 }) {
  const groupRef = useRef<Group>(null!)

  useFrame(() => {
    console.log(moviment)

    groupRef.current.children.forEach((child) => {
      if (child.isObject3D) {
        child.position.add(moviment)
      }
    })
  })

  return <group ref={groupRef}>{children}</group>
}

export default Mover
