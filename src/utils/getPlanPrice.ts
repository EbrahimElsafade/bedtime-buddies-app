const symbols: Record<string, string> = {
  EG: 'EGP',
  US: 'USD',
  SA: 'SAR',
  AE: 'AED',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  OM: 'OMR',
}

const yearlyPricing: Record<string, number> = {
  EG: 499.99,
  US: 99.99,
  SA: 374.83,
  AE: 367.25,
  KW: 364.03,
  QA: 36.99,
  BH: 37.66,
  OM: 38.46,
}

const monthlyPricing: Record<string, number> = {
  EG: 99.99,
  US: 19.99,
  SA: 74.97,
  AE: 73.45,
  KW: 6.17,
  QA: 72.81,
  BH: 7.53,
  OM: 7.69,
}

export function getCurrencySymbol(countryCode: string): string {
  return symbols[countryCode || 'EG'] || '$'
}

export function getPlanPrice(countryCode: string, plan: 'yearly' | 'monthly' = 'yearly'): number {
  const pricing = plan === 'monthly' ? monthlyPricing : yearlyPricing
  return pricing[countryCode || 'EG'] || pricing['EG']
}
