import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Docs' }, { name: 'description', content: 'Docs' }]
}

export default function Home() {
  return <div>Docs</div>
}
