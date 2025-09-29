import { createContext } from 'react'

export type Language = 'en' | 'ar' | 'fr'

export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
})

export default LanguageContext


