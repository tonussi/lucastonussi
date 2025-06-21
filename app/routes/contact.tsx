import { useTranslation } from 'react-i18next'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: t('contact.title') }, { name: 'description', content: t('contact.title') }]
}

export default function Contact() {
  const { t } = useTranslation()

  return (
    <div className="h-full" style={{ height: '20vh' }}>
      <div className="flex flex-col items-center justify-center">
        <p>{t('contact.title')}</p>
        <a href="mailto:lptonussi@gmail.com">lptonussi@gmail.com</a>
      </div>
    </div>
  )
}
