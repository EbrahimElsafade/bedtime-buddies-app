type Lang = 'en' | 'ar' | 'fr'

export function getLocalized(
  obj: Record<string, any> | undefined | null,
  field: string,
  lang: Lang,
  fallback: Lang = 'en',
): any {
  if (!obj) return ''
  const key = `${field}_${lang}`
  const fallbackKey = `${field}_${fallback}`

  const value = obj[key] ?? obj[fallbackKey] ?? obj[field]
  return value ?? ''
}
