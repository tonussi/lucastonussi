import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'About' }, { name: 'description', content: 'About' }]
}

export default function About() {
  return (
    <div className="h-full" style={{ height: '20vh' }}>
      About
    </div>
  )
}
