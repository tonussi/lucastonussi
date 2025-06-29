import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

// Custom hook for loading player model
const usePlayerModel = () => {
  const [fbxExists, setFbxExists] = useState(false)

  useEffect(() => {
    const checkFbxExists = async () => {
      try {
        const response = await fetch('/models/misc/skeleton/pirate.gltf', {
          cache: 'force-cache',
        })
        setFbxExists(response.ok)
      } catch (error) {
        console.error('Error checking FBX file:', error)
        setFbxExists(false)
      }
    }
    checkFbxExists()
  }, [])

  let player: THREE.Group | null = null

  if (fbxExists) {
    const { scene, nodes, animations } = useGLTF('/models/misc/skeleton/pirate.gltf')

    return { type: 'gltf', player: scene, nodes, animations: animations as THREE.AnimationClip[] }
  }

  player = new THREE.Group()
  const box = new THREE.BoxGeometry(125, 3200, 125)
  box.translate(0, 5, 0)
  const material = new THREE.MeshBasicMaterial({ color: 'magenta' })
  const boxMesh = new THREE.Mesh(box, material)
  player.add(boxMesh)

  return { type: 'box', player, animations: [] as THREE.AnimationClip[] }
}

export default usePlayerModel
