import { useMemo } from 'react'
import { generateGrass } from '../game-engine/grass-generator'
import type { GrassSettings } from '../game-engine/types'
import GrassBlades from './grass-blades'

interface GrassMeshProps {
  settings: GrassSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function GrassMesh({ settings, color, selected, onClick }: GrassMeshProps) {
  const { bladeCount, height, width, depth, seed } = settings
  const blades = useMemo(
    () => generateGrass({ bladeCount, height, width, depth, seed }),
    [bladeCount, height, width, depth, seed],
  )

  return (
    <group onClick={onClick}>
      <GrassBlades blades={blades} color={color} selected={selected} />
      {onClick && (
        <mesh position-y={height / 2}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </group>
  )
}
