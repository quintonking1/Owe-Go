import { useCallback, useEffect, useState } from 'react'
import { getRate } from '../lib/frankfurter.js'

/**
 * Look up the exchange rate for one day, and look it up again whenever the
 * currencies or the date change.
 *
 * Returns { status, rate, rateDate, retry }:
 * - status: 'loading', 'ready', or 'error' (Frankfurter failed or stalled)
 * - rate, rateDate: set when status is 'ready'
 * - retry(): try again after an error
 */
export function useRate(from, to, date) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  // Identifies one lookup. A result only counts if it's for the current one.
  const request = `${from}>${to}@${date}#${attempt}`

  useEffect(() => {
    let cancelled = false

    getRate(from, to, date)
      .then(({ rate, rateDate }) => {
        if (!cancelled) setResult({ request, status: 'ready', rate, rateDate })
      })
      .catch(() => {
        if (!cancelled) setResult({ request, status: 'error' })
      })

    // If the inputs change before the answer arrives, ignore the late answer.
    return () => {
      cancelled = true
    }
  }, [from, to, date, request])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  if (result?.request !== request) return { status: 'loading', retry }
  return { status: result.status, rate: result.rate, rateDate: result.rateDate, retry }
}
