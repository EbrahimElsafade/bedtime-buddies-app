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

const pricing: Record<string, number> = {
  EG: 499,
  US: 9.49,
  SA: 35.59,
  AE: 34.85,
  KW: 2.92,
  QA: 34.66,
  BH: 3.58,
  OM: 3.65,
}

export function getCurrencySymbol(countryCode: string): string {
  return symbols[countryCode || 'EG'] || '$'
}

export function getPlanPrice(countryCode: string): number {
  return pricing[countryCode || 'EG'] || pricing['EG']
}
