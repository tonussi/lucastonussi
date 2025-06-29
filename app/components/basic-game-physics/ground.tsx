import { type ThreeElements } from '@react-three/fiber'
import { useEffect } from 'react'

type GroundProps = ThreeElements['mesh'] & { active: boolean }

function Ground({ active, ...props }: GroundProps) {
  useEffect(() => {}, [active])
  return <mesh {...props}>{active && <gridHelper args={[40, 40, 0x424242, 0x888888]} />}</mesh>
}

export default Ground
