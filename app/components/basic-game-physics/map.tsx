import { useAnimations, useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const Map = ({ model, ...props }: { model: string }) => {
  const { scene, animations } = useGLTF(model)
  const group = useRef<THREE.Group>(null!)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        console.log(123)

        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useEffect(() => {
    if (actions && animations.length > 0) {
      actions?.[animations[0].name]?.play()
    }
  }, [actions])

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} {...props} ref={group} />
      </RigidBody>
    </group>
  )
}
