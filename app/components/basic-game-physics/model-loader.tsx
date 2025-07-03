import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/skeleton/pirate.gltf'

// Custom hook for loading player model
const usePlayerModel = () => {
  const [fbxExists, setFbxExists] = useState(false)
  const [applyOneTimeOnlyThings, setApplyOneTimeOnlyThings] = useState(true)

  const traverseMaterialsApplyingEffects = (player: THREE.Group) => {
    // Make all materials wireframe
    if (player) {
      player.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.transparent = true
              mat.opacity = 0.1
              mat.wireframe = true
            })
          } else {
            child.material.transparent = true
            child.material.opacity = 0.1
            child.material.wireframe = true
          }
        }
      })
    }
  }

  useEffect(() => {
    const checkModelFileExists = async () => {
      try {
        const response = await fetch(MODEL_PATH, {
          cache: 'force-cache',
        })
        setFbxExists(response.ok)
      } catch (error) {
        console.error('Error checking FBX file:', error)
        setFbxExists(false)
      }
    }
    checkModelFileExists()
  }, [])

  // let player: THREE.Group | null = null

  const { scene, nodes, animations } = useGLTF(MODEL_PATH)

  if (applyOneTimeOnlyThings) {
    setApplyOneTimeOnlyThings(false)
    scene.rotation.set(0, Math.PI, 0)
    scene.scale.set(0.0005, 0.0005, 0.0005)

    const skeleton = new THREE.SkeletonHelper(scene as THREE.Object3D)
    // const axesHelper = new THREE.AxesHelper(10)

    skeleton.visible = true
    // axesHelper.visible = true

    scene.add(skeleton)
    // scene.add(axesHelper)
    traverseMaterialsApplyingEffects(scene)
  }

  return { type: 'gltf', player: scene, nodes, animations: animations as THREE.AnimationClip[] }
}

export default usePlayerModel
