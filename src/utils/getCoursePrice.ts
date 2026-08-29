/**
 * Courses have two explicit prices set by admins:
 * - `price` (EGP) shown to visitors inside Egypt (and when detection fails)
 * - `price_usd` (USD) shown to every other visitor
 */

export const DEFAULT_COURSE_PRICE_EGP = 100

export interface CoursePriceInput {
  priceEgp?: number
  priceUsd?: number
}

const isEgypt = (countryCode: string | null | undefined) =>
  !countryCode || countryCode.toUpperCase() === 'EG'

const round = (amount: number) =>
  Number.isInteger(amount) ? amount : Number(amount.toFixed(2))

/** Amount + currency for the visitor's country. */
export const getCoursePrice = (
  { priceEgp, priceUsd }: CoursePriceInput,
  countryCode: string | null | undefined,
): { amount: number; currency: string } => {
  const egp = typeof priceEgp === 'number' && priceEgp > 0 ? priceEgp : DEFAULT_COURSE_PRICE_EGP

  if (isEgypt(countryCode)) {
    return { amount: round(egp), currency: 'EGP' }
  }

  // Fall back to the EGP price (labeled EGP) until an admin sets a USD price.
  if (typeof priceUsd === 'number' && priceUsd > 0) {
    return { amount: round(priceUsd), currency: 'USD' }
  }

  return { amount: round(egp), currency: 'EGP' }
}

/** Ready-to-render "100 EGP" / "10 USD" string. */
export const formatCoursePrice = (
  input: CoursePriceInput,
  countryCode: string | null | undefined,
): string => {
  const { amount, currency } = getCoursePrice(input, countryCode)
  return `${amount} ${currency}`
}
