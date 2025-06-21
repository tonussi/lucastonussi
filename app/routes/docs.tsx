import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Docs' }, { name: 'description', content: 'Docs' }]
}

export default function Docs() {
  return (
    <div className="h-full fade-in-100 fade-out-100" style={{ height: '20vh' }}>
      Docs
    </div>
  )
}
