import { createContext } from 'react'

export type Language = 'en' | 'ar' | 'fr'

export type LanguageContextType = {
  language: Language
  direction: 'ltr' | 'rtl'
  setLanguage: (language: Language) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  direction: 'rtl',
  setLanguage: () => {},
  t: (key: string) => key,
})

export default LanguageContext


