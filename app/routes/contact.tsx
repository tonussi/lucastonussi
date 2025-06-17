import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Contact' }, { name: 'description', content: 'Contact' }]
}

export default function Home() {
  return <div>Contact</div>
}
