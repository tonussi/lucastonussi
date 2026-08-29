import { MonitorSellsSection } from '@/components/monitor-sells/section'
import { Slogan } from '@/components/slogan'
import { t } from 'i18next'
import { FloatingWhatsApp } from 'react-floating-whatsapp'
import type { Route } from './+types/home'
import i18n from '@/i18n'

export function meta({}: Route.MetaArgs) {
  const title = i18n.t('meta.home.title')
  const description = i18n.t('meta.home.description')

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: i18n.t('meta.home.keywords') },
    { name: 'author', content: i18n.t('meta.author') },
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { property: 'og:locale', content: i18n.language.replace('-', '_') },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: i18n.t('meta.siteName') },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ]
}

export default function Home() {
  return (
    <>
      <div className="grid xs:grid-rows-2 3xl:grid-cols-1 gap-30">
        <Slogan />
        <MonitorSellsSection />
        <FloatingWhatsApp
          phoneNumber="5548988155946"
          accountName="T Labs"
          avatar="/apple-touch-icon.png"
          chatMessage={t('floatingWhatsApp.chatMessage')}
          buttonStyle={{ bottom: '100px' }}
        />
      </div>
    </>
  )
}
