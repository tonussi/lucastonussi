import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Contact' }, { name: 'description', content: 'Contact' }]
}

export default function Contact() {
  return (
    <div className="h-full" style={{ height: '20vh' }}>
      lptonussi@gmail.com
    </div>
  )
}
