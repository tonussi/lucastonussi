import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { generateTree, type TreeBranch } from '../game-engine/tree-generator'
import type { TreeSettings } from '../game-engine/types'

const TRUNK_COLOR = '#6b4a2b'
const CYLINDER_SEGMENTS = 8
const LEAF_DETAIL = 1

const branchStart = new THREE.Vector3()
const branchEnd = new THREE.Vector3()
const branchDirection = new THREE.Vector3()
const branchMidpoint = new THREE.Vector3()
const branchScale = new THREE.Vector3()
const branchQuaternion = new THREE.Quaternion()
const leafPosition = new THREE.Vector3()
const leafScale = new THREE.Vector3()
const identityQuaternion = new THREE.Quaternion()
const matrix = new THREE.Matrix4()
const UP = new THREE.Vector3(0, 1, 0)

function writeBranchMatrix(branch: TreeBranch, target: THREE.Matrix4) {
  branchStart.set(...branch.start)
  branchEnd.set(...branch.end)
  branchDirection.subVectors(branchEnd, branchStart)
  const length = branchDirection.length()
  branchQuaternion.setFromUnitVectors(UP, branchDirection.normalize())
  branchMidpoint.addVectors(branchStart, branchEnd).multiplyScalar(0.5)
  branchScale.set(branch.radius, length, branch.radius)
  target.compose(branchMidpoint, branchQuaternion, branchScale)
}

interface TreeMeshProps {
  settings: TreeSettings
  leafColor: string
  selected: boolean
  onClick?: (event: { stopPropagation: () => void }) => void
}

export default function TreeMesh({ settings, leafColor, selected, onClick }: TreeMeshProps) {
  const { height, branchCount, leafCount, leafSize, seed } = settings
  const tree = useMemo(
    () => generateTree({ height, branchCount, leafCount, leafSize, seed }),
    [height, branchCount, leafCount, leafSize, seed],
  )
  const woodRef = useRef<THREE.InstancedMesh>(null)
  const leavesRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const wood = woodRef.current
    if (!wood) return
    writeBranchMatrix(tree.trunk, matrix)
    wood.setMatrixAt(0, matrix)
    tree.branches.forEach((branch, index) => {
      writeBranchMatrix(branch, matrix)
      wood.setMatrixAt(index + 1, matrix)
    })
    wood.instanceMatrix.needsUpdate = true
    wood.computeBoundingSphere()
  }, [tree])

  useLayoutEffect(() => {
    const leaves = leavesRef.current
    if (!leaves) return
    tree.leaves.forEach(({ position, size }, index) => {
      leafPosition.set(...position)
      leafScale.set(size * 1.5, size * 0.55, size)
      identityQuaternion.setFromEuler(new THREE.Euler(index * 2.4, index * 1.7, index * 0.6))
      matrix.compose(leafPosition, identityQuaternion, leafScale)
      leaves.setMatrixAt(index, matrix)
      leaves.setColorAt(index, new THREE.Color(leafColor).multiplyScalar(0.8 + (index % 7) * 0.055))
    })
    leaves.instanceMatrix.needsUpdate = true
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true
    leaves.computeBoundingSphere()
  }, [tree, leafColor])

  const emissive = selected ? '#8a631e' : '#000000'
  const emissiveIntensity = selected ? 0.6 : 0

  return (
    <group onClick={onClick}>
      <instancedMesh
        key={`wood-${tree.branches.length}`}
        ref={woodRef}
        args={[undefined, undefined, tree.branches.length + 1]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, CYLINDER_SEGMENTS]} />
        <meshStandardMaterial color={TRUNK_COLOR} roughness={0.9} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </instancedMesh>
      {tree.leaves.length > 0 && (
        <instancedMesh
          key={`leaves-${tree.leaves.length}`}
          ref={leavesRef}
          args={[undefined, undefined, tree.leaves.length]}
          castShadow
        >
          <icosahedronGeometry args={[1, LEAF_DETAIL]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </instancedMesh>
      )}
    </group>
  )
}
