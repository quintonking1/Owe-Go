/**
 * The currencies the app offers: every currency Frankfurter has rates for.
 * The first six are the ones people pick most, so they stay at the top.
 */
export const CURRENCIES = [
  { code: 'USD', name: 'US dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese yen', symbol: '¥' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British pound', symbol: '£' },
  { code: 'THB', name: 'Thai baht', symbol: '฿' },
  { code: 'MXN', name: 'Mexican peso', symbol: 'MX$' },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$' },
  { code: 'BRL', name: 'Brazilian real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'CA$' },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese yuan', symbol: 'CN¥' },
  { code: 'CZK', name: 'Czech koruna', symbol: 'Kč' },
  { code: 'DKK', name: 'Danish krone', symbol: 'kr' },
  { code: 'HKD', name: 'Hong Kong dollar', symbol: 'HK$' },
  { code: 'HUF', name: 'Hungarian forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli shekel', symbol: '₪' },
  { code: 'INR', name: 'Indian rupee', symbol: '₹' },
  { code: 'ISK', name: 'Icelandic króna', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean won', symbol: '₩' },
  { code: 'MYR', name: 'Malaysian ringgit', symbol: 'RM' },
  { code: 'NOK', name: 'Norwegian krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand dollar', symbol: 'NZ$' },
  { code: 'PHP', name: 'Philippine peso', symbol: '₱' },
  { code: 'PLN', name: 'Polish złoty', symbol: 'zł' },
  { code: 'RON', name: 'Romanian leu', symbol: 'lei' },
  { code: 'SEK', name: 'Swedish krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore dollar', symbol: 'S$' },
  { code: 'TRY', name: 'Turkish lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African rand', symbol: 'R' },
]

/** Find a currency by its code, e.g. currencyByCode('JPY'). */
export function currencyByCode(code) {
  return CURRENCIES.find((currency) => currency.code === code)
}

/**
 * The currency spent in each country, by two-letter country code. Only
 * currencies Frankfurter has rates for are listed, so a country missing here
 * has no local currency we can convert from.
 */
const COUNTRY_CURRENCY = {
  // Euro area, plus places that use the euro without being members.
  ...Object.fromEntries(
    [
      'AT', 'BE', 'BG', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PT', 'SK', 'SI', 'ES', 'AD', 'MC', 'SM', 'VA', 'ME', 'XK', 'AX', 'GF', 'GP', 'MQ', 'RE', 'YT', 'BL',
      'MF', 'PM',
    ].map((country) => [country, 'EUR']),
  ),
  ...Object.fromEntries(
    ['US', 'PR', 'GU', 'VI', 'AS', 'MP', 'EC', 'SV', 'PA', 'TL', 'FM', 'MH', 'PW', 'BQ', 'TC', 'VG'].map(
      (country) => [country, 'USD'],
    ),
  ),
  AU: 'AUD', CX: 'AUD', CC: 'AUD', NF: 'AUD', KI: 'AUD', NR: 'AUD', TV: 'AUD',
  BR: 'BRL',
  CA: 'CAD',
  CH: 'CHF', LI: 'CHF',
  CN: 'CNY',
  CZ: 'CZK',
  DK: 'DKK', GL: 'DKK', FO: 'DKK',
  GB: 'GBP', IM: 'GBP', JE: 'GBP', GG: 'GBP',
  HK: 'HKD',
  HU: 'HUF',
  ID: 'IDR',
  IL: 'ILS',
  IN: 'INR',
  IS: 'ISK',
  JP: 'JPY',
  KR: 'KRW',
  MX: 'MXN',
  MY: 'MYR',
  NO: 'NOK', SJ: 'NOK',
  NZ: 'NZD', CK: 'NZD', NU: 'NZD', PN: 'NZD', TK: 'NZD',
  PH: 'PHP',
  PL: 'PLN',
  RO: 'RON',
  SE: 'SEK',
  SG: 'SGD',
  TH: 'THB',
  TR: 'TRY',
  ZA: 'ZAR',
}

/** The currency spent in a country ('JP' -> 'JPY'), or null if we have no rates for it. */
export function currencyForCountry(countryCode) {
  return COUNTRY_CURRENCY[countryCode?.toUpperCase()] ?? null
}
