import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'About' }, { name: 'description', content: 'About' }]
}

export default function Home() {
  return <div>About</div>
}
