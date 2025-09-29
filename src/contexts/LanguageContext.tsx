import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'
import i18n from '@/i18n'

type Language = 'en' | 'ar' | 'fr'

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const initial = (i18n.language?.split('-')[0] || 'en') as Language
  const [language, setLanguageState] = useState<Language>(initial)

  // Keep HTML dir/lang in sync (also handled inside i18n on languageChanged)
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
