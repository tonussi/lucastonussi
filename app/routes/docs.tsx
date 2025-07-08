import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Docs' }, { name: 'description', content: 'Docs' }]
}

export default function Docs() {
  return (
    <div className="h-full max-w-10/12 sm:max-w mx-auto mt-30 mb-30" style={{ height: '20vh' }}>
      Soon...
    </div>
  )
}
