/**
 * Courses have two explicit prices set by admins, each with its own discount:
 * - `price` + `discount_percent` (EGP) shown to visitors inside Egypt (and when detection fails)
 * - `price_usd` + `discount_percent_usd` (USD) shown to every other visitor
 *
 * The stored price is the ORIGINAL (pre-discount) price; the final price is calculated.
 */

export const DEFAULT_COURSE_PRICE_EGP = 100

export interface CoursePriceInput {
  priceEgp?: number
  priceUsd?: number
  discountEgp?: number
  discountUsd?: number
}

export interface CoursePriceResult {
  originalAmount: number
  finalAmount: number
  discountPercent: number
  currency: string
  hasDiscount: boolean
}

const isEgypt = (countryCode: string | null | undefined) =>
  !countryCode || countryCode.toUpperCase() === 'EG'

const round = (amount: number) =>
  Number.isInteger(amount) ? amount : Number(amount.toFixed(2))

const clampDiscount = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return Math.min(value, 100)
}

const build = (original: number, discount: number, currency: string): CoursePriceResult => {
  const discountPercent = clampDiscount(discount)
  const originalAmount = round(original)
  const finalAmount = round(originalAmount * (1 - discountPercent / 100))
  return {
    originalAmount,
    finalAmount,
    discountPercent,
    currency,
    hasDiscount: discountPercent > 0 && finalAmount < originalAmount,
  }
}

/** Original + final amount and currency for the visitor's country. */
export const getCoursePrice = (
  { priceEgp, priceUsd, discountEgp, discountUsd }: CoursePriceInput,
  countryCode: string | null | undefined,
): CoursePriceResult => {
  const egp = typeof priceEgp === 'number' && priceEgp > 0 ? priceEgp : DEFAULT_COURSE_PRICE_EGP

  if (isEgypt(countryCode)) {
    return build(egp, discountEgp, 'EGP')
  }

  if (typeof priceUsd === 'number' && priceUsd > 0) {
    return build(priceUsd, discountUsd, 'USD')
  }

  // Fall back to the EGP price (labeled EGP) until an admin sets a USD price.
  return build(egp, discountEgp, 'EGP')
}

/** Ready-to-render final price, e.g. "80 EGP" — used in the WhatsApp message. */
export const formatCoursePrice = (
  input: CoursePriceInput,
  countryCode: string | null | undefined,
): string => {
  const { finalAmount, currency } = getCoursePrice(input, countryCode)
  return `${finalAmount} ${currency}`
}

/** Ready-to-render original price, e.g. "100 EGP". */
export const formatCourseOriginalPrice = (
  input: CoursePriceInput,
  countryCode: string | null | undefined,
): string => {
  const { originalAmount, currency } = getCoursePrice(input, countryCode)
  return `${originalAmount} ${currency}`
}
