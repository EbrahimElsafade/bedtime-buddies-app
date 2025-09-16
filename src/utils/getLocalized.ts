// utils/getLocalized.ts
type Lang = 'en' | 'ar' | 'fr'

export function getLocalized(
  obj: Record<string, unknown> | undefined | null,
  field: string,
  lang: Lang,
  fallback: Lang = 'en',
): string {
  if (!obj) return ''

  const key = `${field}_${lang}`
  const fallbackKey = `${field}_${fallback}`

  const value = obj[key] ?? obj[fallbackKey] ?? obj[field]

  return typeof value === 'string' ? value : String(value ?? '')
}
