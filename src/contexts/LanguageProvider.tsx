import React, { useEffect, useState } from 'react'
import i18n from '@/i18n'
import LanguageContext, { type Language } from './language-context'

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const initial = (i18n.language?.split('-')[0] || 'en') as Language
  const [language, setLanguageState] = useState<Language>(initial)

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

  const setLanguage = (lng: Language) => {
    i18n.changeLanguage(lng)
  }

  const t = (key: string, options?: Record<string, unknown>): string => {
    return i18n.t(key, options as any)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}


