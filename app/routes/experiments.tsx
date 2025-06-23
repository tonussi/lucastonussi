import type { Route } from './+types/home'

import CarBuildShare from '@/components/car-build-share/components'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Experiments' }, { name: 'description', content: 'Experiments' }]
}

export default function Experiments() {
  return <CarBuildShare />
}
