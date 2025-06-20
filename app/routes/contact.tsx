import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Contact' }, { name: 'description', content: 'Contact' }]
}

export default function Contact() {
  return (
    <div className="h-full" style={{ height: '20vh' }}>
      <div className="flex flex-col items-center justify-center text-2xl">
        <p>For business inquiries, please contact me at </p>
        <a href="mailto:lptonussi@gmail.com">lptonussi@gmail.com</a>
      </div>
    </div>
  )
}
