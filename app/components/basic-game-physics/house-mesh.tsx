import { useMemo } from 'react'
import * as THREE from 'three'
import { buildHouse, type HousePiece } from '../game-engine/house-layout'
import type { HouseSettings } from '../game-engine/types'

const ROOF_COLOR = '#8a3b2a'
const FLOOR_COLOR = '#6b5a45'

function createGableGeometry(width: number, height: number, thickness: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(0, height)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
  geometry.translate(0, 0, -thickness / 2)
  return geometry
}

function pieceColor(piece: HousePiece, wallColor: string) {
  if (piece.kind === 'roof') return ROOF_COLOR
  if (piece.kind === 'floor') return FLOOR_COLOR
  return wallColor
}

interface HouseMeshProps {
  settings: HouseSettings
  color: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function HouseMesh({ settings, color, selected, onClick }: HouseMeshProps) {
  const { width, depth, wallHeight, roofHeight } = settings
  const pieces = useMemo(
    () => buildHouse({ width, depth, wallHeight, roofHeight }),
    [width, depth, wallHeight, roofHeight],
  )
  const gableGeometry = useMemo(
    () => createGableGeometry(width, roofHeight, pieces.find(({ kind }) => kind === 'gable')?.size[2] ?? 0),
    [width, roofHeight, pieces],
  )

  return (
    <group onClick={onClick}>
      {pieces.map((piece, index) => (
        <mesh
          key={index}
          position={piece.position}
          rotation-z={piece.rotationZ}
          geometry={piece.kind === 'gable' ? gableGeometry : undefined}
          castShadow
          receiveShadow
        >
          {piece.kind !== 'gable' && <boxGeometry args={piece.size} />}
          <meshStandardMaterial
            color={pieceColor(piece, color)}
            roughness={0.85}
            emissive={selected ? '#8a631e' : '#000000'}
            emissiveIntensity={selected ? 0.4 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}
