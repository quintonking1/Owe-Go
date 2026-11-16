/**
 * Money helpers. Amounts are stored as whole numbers in the currency's
 * smallest unit: cents for USD and EUR, whole yen for JPY. Whole numbers
 * avoid the rounding slips that decimals cause.
 */

const MINUS = '−' // a real minus sign, wider than a hyphen

/** How many decimal places a currency uses: 2 for USD, 0 for JPY. */
export function decimalPlaces(currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits
}

/**
 * Turn a smallest-unit amount into text: (18760, 'USD') -> "$187.60".
 * Pass { showPlus: true } to put a + in front of positive amounts.
 */
export function formatMoney(amount, currency, { showPlus = false } = {}) {
  const text = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    signDisplay: showPlus ? 'exceptZero' : 'auto',
  }).format(amount / 10 ** decimalPlaces(currency))
  return text.replace('-', MINUS)
}

/**
 * Convert an amount into the home currency, using the given rate.
 * Both the input and the result are in smallest units.
 */
export function convertToHome(amount, fromCurrency, rate, homeCurrency) {
  const wholeUnits = amount / 10 ** decimalPlaces(fromCurrency)
  return Math.round(wholeUnits * rate * 10 ** decimalPlaces(homeCurrency))
}
