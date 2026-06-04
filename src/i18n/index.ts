import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Bundle locales at build time to avoid runtime fetches that can fail/timeout
// on production hosts (CDN, service worker, etc.)
const modules = import.meta.glob('../../public/locales/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, unknown>>

const resources: Record<string, Record<string, Record<string, unknown>>> = {}
for (const [path, content] of Object.entries(modules)) {
  const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) continue
  const [, lng, ns] = match
  resources[lng] ??= {}
  resources[lng][ns] = content
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
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
