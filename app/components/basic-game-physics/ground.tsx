import { type ThreeElements } from '@react-three/fiber'
import { useEffect } from 'react'

type GroundProps = ThreeElements['mesh'] & { active: boolean; receiveShadow?: boolean }

function Ground({ active, receiveShadow = false, ...props }: GroundProps) {
  useEffect(() => {}, [active])
  return (
    <mesh {...props} receiveShadow={receiveShadow}>
      {active && <gridHelper args={[40, 40]} />}
      <meshStandardMaterial />
    </mesh>
  )
}

export default Ground
