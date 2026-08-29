import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en-US/translation.json'
import ptTranslations from './locales/pt-BR/translation.json'

export const DEFAULT_LANGUAGE = 'pt-BR'

const resources = {
  'pt-BR': {
    translation: ptTranslations,
  },
  'en-US': {
    translation: enTranslations,
  },
}

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return localStorage.getItem('language') ?? DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ['pt-BR', 'en-US'],

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})

export default i18n
