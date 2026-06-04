import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { Resource } from 'i18next'

const localeModules = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>

const resources = Object.entries(localeModules).reduce<Resource>((acc, [path, module]) => {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return acc

  const [, lng, ns] = match
  acc[lng] = acc[lng] || {}
  acc[lng][ns] = module.default
  return acc
}, {})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ar', // Force Arabic as default
    fallbackLng: 'ar',
    resources,
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
    defaultNS: 'common',
    ns: [
      'common',
      'navigation',
      'auth',
      'hero',
      'stories',
      'features',
      'admin',
      'misc',
      'premium',
      'subscription',
      'notFound',
      'games',
      'courses',
      'story',
      'social',
      'meta',
      'skillPaths',
    ],
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
