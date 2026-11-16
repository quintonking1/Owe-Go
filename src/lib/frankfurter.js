/**
 * Exchange rates from the Frankfurter API (https://frankfurter.dev).
 * This is the only outside service the app talks to.
 * We always ask for the rate on the day an expense was paid, never today's.
 */

const API = 'https://api.frankfurter.dev/v1'
const CACHE_KEY = 'oweandgo:rates:v1'

/** Thrown when a rate can't be fetched. Screens show "Rates unavailable". */
export class RatesUnavailableError extends Error {
  constructor() {
    super('Could not reach the exchange rate service.')
    this.name = 'RatesUnavailableError'
  }
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // The cache only saves repeat requests, so a failed write doesn't matter.
  }
}

/**
 * Get the rate from one currency to another on a given day ("YYYY-MM-DD").
 * Returns { rate, rateDate }.
 *
 * rateDate is the day the rate was published. On weekends and holidays
 * Frankfurter gives the last business day, so it can be earlier than `date`.
 */
export async function getRate(from, to, date) {
  if (from === to) return { rate: 1, rateDate: date }

  const key = `${from}>${to}@${date}`
  const cached = readCache()[key]
  if (cached) return cached

  let data
  try {
    const response = await fetch(`${API}/${date}?base=${from}&symbols=${to}`)
    if (!response.ok) throw new RatesUnavailableError()
    data = await response.json()
  } catch {
    throw new RatesUnavailableError()
  }

  const rate = data?.rates?.[to]
  if (typeof rate !== 'number' || !data.date) throw new RatesUnavailableError()

  const result = { rate, rateDate: data.date }
  writeCache({ ...readCache(), [key]: result })
  return result
}
