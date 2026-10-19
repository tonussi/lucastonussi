import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildHouse, buildHouseWindows, type HousePiece, type HouseWindow } from '../game-engine/house-layout'
import type { HouseSettings } from '../game-engine/types'

const ROOF_COLOR = '#8a3b2a'
const FLOOR_COLOR = '#6b5a45'
const TIMBER_COLOR = '#49382a'
const WINDOW_COLOR = '#293a40'

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

const FRAME_BAR = 0.08
const FRAME_PROUD = 0.06
const GLASS_OPACITY = 0.15

/** Timber frame around an open window with a faint glass pane; the opening itself is real. */
function WindowFrame({ window }: { window: HouseWindow }) {
  const [span, tall, thick] = window.size
  const depth = thick + FRAME_PROUD
  const bars: [number, number, number, number][] = [
    [0, (tall - FRAME_BAR) / 2, span, FRAME_BAR],
    [0, -(tall - FRAME_BAR) / 2, span, FRAME_BAR],
    [-(span - FRAME_BAR) / 2, 0, FRAME_BAR, tall],
    [(span - FRAME_BAR) / 2, 0, FRAME_BAR, tall],
    [0, 0, FRAME_BAR / 2, tall],
  ]
  return (
    <group position={window.position} rotation-y={window.axis === 'z' ? Math.PI / 2 : 0}>
      {bars.map(([x, y, w, h], index) => (
        <mesh key={index} position={[x, y, 0]}>
          <boxGeometry args={[w, h, depth]} />
          <meshStandardMaterial color={TIMBER_COLOR} roughness={1} />
        </mesh>
      ))}
      <mesh>
        <planeGeometry args={[span, tall]} />
        <meshStandardMaterial color={WINDOW_COLOR} transparent opacity={GLASS_OPACITY} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
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
  const windows = useMemo(() => buildHouseWindows({ width, depth, wallHeight, roofHeight }), [width, depth, wallHeight, roofHeight])
  const gableGeometry = useMemo(
    () => createGableGeometry(width, roofHeight, pieces.find(({ kind }) => kind === 'gable')?.size[2] ?? 0),
    [width, roofHeight, pieces],
  )
  useEffect(() => () => gableGeometry.dispose(), [gableGeometry])

  return (
    <group onClick={onClick}>
      {[-1, 1].map(side => <group key={side}>
        <mesh position={[side * (width / 2 - 0.12), wallHeight / 2, depth / 2]} castShadow>
          <boxGeometry args={[0.22, wallHeight, 0.22]} />
          <meshStandardMaterial color={TIMBER_COLOR} roughness={1} />
        </mesh>
      </group>)}
      <mesh position={[0, wallHeight, depth / 2]} castShadow>
        <boxGeometry args={[width, 0.2, 0.3]} />
        <meshStandardMaterial color={TIMBER_COLOR} roughness={1} />
      </mesh>
      {windows.map((window, index) => <WindowFrame key={index} window={window} />)}
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
