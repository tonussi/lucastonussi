import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Docs' }, { name: 'description', content: 'Docs' }]
}

export default function Docs() {
  return (
    <div className="h-full" style={{ height: '20vh' }}>
      Soon...
    </div>
  )
}
