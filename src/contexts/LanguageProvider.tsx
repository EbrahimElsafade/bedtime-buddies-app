import { useEffect, useState } from 'react'
import i18n from '@/i18n'
import LanguageContext, { type Language } from './language-context'

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const initial = (i18n.language?.split('-')[0] || 'en') as Language
  const [language, setLanguageState] = useState<Language>(initial)
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const handler = (lng: string) => {
      const base = (lng?.split('-')[0] || 'en') as Language
      setLanguageState(base)
    }
    i18n.on('languageChanged', handler)
    return () => {
      i18n.off('languageChanged', handler)
    }
  }, [])

  useEffect(() => {
    // Update document language and direction
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [language, direction])

  const setLanguage = (lng: Language) => {
    i18n.changeLanguage(lng)
  }

  const t = (key: string, options?: Record<string, unknown>): string => {
    const result = i18n.t(key, options as Record<string, unknown>)
    return typeof result === 'string' ? result : String(result)
  }

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider;

