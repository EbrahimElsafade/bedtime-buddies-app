import { getCurrencySymbol, getPlanPrice } from './getPlanPrice'

/**
 * Course prices are stored once in EGP on the course row.
 *
 * To keep pricing consistent with the existing subscription price table, the
 * EGP amount is scaled by the same country ratio already used for the yearly
 * plan (country price / Egypt price).
 */
const getCountryRatio = (countryCode: string): number => {
  const base = getPlanPrice('EG', 'yearly')
  const local = getPlanPrice(countryCode, 'yearly')
  if (!base || !local) return 1
  return local / base
}

export const DEFAULT_COURSE_PRICE_EGP = 100

/** Converted numeric price for the visitor's country. */
export const getCoursePrice = (priceEgp: number | undefined, countryCode: string): number => {
  const base = typeof priceEgp === 'number' && priceEgp > 0 ? priceEgp : DEFAULT_COURSE_PRICE_EGP
  const converted = base * getCountryRatio(countryCode)
  return Math.round(converted * 100) / 100
}

/** Currency code (EGP, USD, ...) matching the visitor's country. */
export const getCourseCurrency = (countryCode: string): string => getCurrencySymbol(countryCode)

/** Ready-to-render "100 EGP" style string. */
export const formatCoursePrice = (
  priceEgp: number | undefined,
  countryCode: string,
): string => {
  const amount = getCoursePrice(priceEgp, countryCode)
  const rounded = Number.isInteger(amount) ? amount : Number(amount.toFixed(2))
  return `${rounded} ${getCourseCurrency(countryCode)}`
}
