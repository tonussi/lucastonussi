import { Html, useProgress } from '@react-three/drei'

function Progress() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(2)} % loaded</Html>
}

export default Progress
