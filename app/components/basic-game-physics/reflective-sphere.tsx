import { Sphere } from '@react-three/drei'
import { useControls } from 'leva'

function ReflectiveSphere() {
  const tweakableProperties = useControls({
    roughness: { value: 0.1, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 },
  })

  return (
    <Sphere args={[1, 256, 256]}>
      <meshStandardMaterial {...tweakableProperties} />
    </Sphere>
  )
}

export default ReflectiveSphere
