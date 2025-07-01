import { type ThreeElements } from '@react-three/fiber'
import { useEffect } from 'react'

type GroundProps = ThreeElements['mesh'] & { active: boolean }

function Ground({ active, ...props }: GroundProps) {
  useEffect(() => {}, [active])
  return (
    <mesh {...props}>
      {active && <gridHelper args={[40, 40]} />}
      <meshStandardMaterial color="transparent" transparent opacity={0.1} />
    </mesh>
  )
}

export default Ground
