import { Html, useProgress } from '@react-three/drei'

function PercentageProgress() {
  const { progress } = useProgress()
  return (
    <Html center style={{ fontSize: '2rem' }}>
      {progress.toFixed(0)}
    </Html>
  )
}

export default PercentageProgress
