import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'

const DungeonScene = ({ active }: { active: boolean }) => {
  const [glbExists, setGlbExists] = useState(false)

  useEffect(() => {
    const checkFbxExists = async () => {
      try {
        const response = await fetch('/models/dungeons/dungeon.glb')
        setGlbExists(response.ok)
      } catch (error) {
        console.error('Error checking FBX file:', error)
        setGlbExists(false)
      }
    }
    checkFbxExists()
  }, [])

  if (!glbExists) {
    const gltf = useGLTF('/models/dungeons/dungeon.glb')
    // const nodes = gltf.nodes
    return active && <primitive object={gltf.scene} scale={0.01} position={[0, 5, 50]} />
  }
}

export default DungeonScene
