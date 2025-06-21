import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'About' }, { name: 'description', content: 'About' }]
}

export default function About() {
  return (
    <div className="h-full fade-in-100 fade-out-100" style={{ height: '20vh' }}>
      About
    </div>
  )
}
