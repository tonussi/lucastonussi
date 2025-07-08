import { useTranslation } from 'react-i18next'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Contact' }, { name: 'description', content: 'Contact' }]
}

export default function Contact() {
  const { t } = useTranslation()

  return (
    <div className="h-full mt-30 mb-30" style={{ height: '20vh' }}>
      <div className="flex flex-col items-center justify-center p-10">
        <p>
          {t('contact.title')} <a href="mailto:lptonussi@gmail.com">lptonussi@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
