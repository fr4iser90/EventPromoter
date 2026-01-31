import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  de: {
    translation: de
  },
  en: {
    translation: en
  },
  es: {
    translation: es
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'de', 'es'],
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    debug: false,

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => lng.split('-')[0]
    }
  })

export default i18n
