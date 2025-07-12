import { MonitorSellsSection } from '@/components/monitor-sells/section'
import { Slogan } from '@/components/slogan'
import { t } from 'i18next'
import { FloatingWhatsApp } from 'react-floating-whatsapp'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'T Labs - Meaning in software' },
    {
      name: 'description',
      content: 'T Labs delivers meaningful solutions to your needs.',
    },
    {
      name: 'keywords',
      content:
        'T Labs, technology solutions, software development, hardware innovation, digital transformation, tech company',
    },
    { name: 'author', content: 'T Labs' },
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { property: 'og:title', content: 'T Labs - Meaning in software' },
    {
      property: 'og:description',
      content: 'T Labs delivers meaningful solutions to your needs.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'T Labs' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'T Labs - Meaning in software' },
    {
      name: 'twitter:description',
      content: 'T Labs delivers meaningful solutions to your needs.',
    },
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
