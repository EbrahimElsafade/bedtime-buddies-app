type Lang = 'en' | 'ar' | 'fr'

export function getLocalized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: Lang,
  fallback: Lang = 'en',
): string {
  const key = `${field}_${lang}`
  const fallbackKey = `${field}_${fallback}`

  console.log(obj[key]);
  console.log(obj);
  

  return (obj[key] as string) ?? (obj[fallbackKey] as string) ?? ''
}
