export const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // English
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en',
  SG: 'en', ZA: 'en', NG: 'en', KE: 'en', GH: 'en', PK: 'en',

  // Hindi
  IN: 'hi',

  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es',
  UY: 'es', PY: 'es', CR: 'es', PA: 'es', SV: 'es', HN: 'es', NI: 'es',

  // French
  FR: 'fr', BE: 'fr', CH: 'fr', SN: 'fr', CI: 'fr', ML: 'fr',
  CM: 'fr', CD: 'fr', HT: 'fr', LU: 'fr',

  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',

  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar',
  QA: 'ar', OM: 'ar', BH: 'ar', LB: 'ar', LY: 'ar', DZ: 'ar',
  MA: 'ar', TN: 'ar', SY: 'ar', YE: 'ar', SD: 'ar', PS: 'ar',

  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',

  // Korean
  KR: 'ko',

  // German
  DE: 'de', AT: 'de', LI: 'de',

  // Turkish
  TR: 'tr',

  // Italian
  IT: 'it', SM: 'it', VA: 'it',

  // Vietnamese
  VN: 'vi',

  // Japanese
  JP: 'ja',

  // Indonesian
  ID: 'id',

  // Thai
  TH: 'th',

  // Polish
  PL: 'pl',

  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',

  // Romanian
  RO: 'ro', MD: 'ro',

  // Afrikaans
  NA: 'af',

  // Hungarian
  HU: 'hu',

  // Ukrainian
  UA: 'uk',

  // Filipino
  PH: 'fil',
};

export function resolveLanguageFromCountry(
  countryCode: string | undefined,
  supportedCodes: string[],
  fallback = 'en',
): string {
  if (!countryCode) return fallback;
  const mapped = COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()];
  if (mapped && supportedCodes.includes(mapped)) {
    return mapped;
  }
  return fallback;
}