import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Dynamically import all locale resources from src/locales
const localeModules = import.meta.glob<Record<string, any>>(
  './locales/**/*.json',
  { eager: true }
)

// Transform the dynamic imports into i18n resources
const resources: Record<string, Record<string, any>> = {
  ar: {},
  en: {},
  fr: {},
}

Object.entries(localeModules).forEach(([path, module]) => {
  const match = path.match(/\.\/(locales)\/([a-z]{2})\/([a-z]+)\.json$/)
  if (match) {
    const [, , lang, namespace] = match
    resources[lang][namespace] = module.default || module
  }
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ar', // Force Arabic as default
    fallbackLng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
    },
    resources,
    defaultNS: 'common',
  })

// Handle RTL direction for Arabic
i18n.on('languageChanged', lng => {
  if (lng === 'ar') {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  } else {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = lng
  }
})

export default i18n
