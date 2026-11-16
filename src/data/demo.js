import { useCallback, useEffect, useState } from 'react'
import { getRate } from '../lib/frankfurter.js'
import { demoExpenseDrafts } from './seed.js'
import { addExpenses, getAppData, markDemoSeeded, useAppData } from './store.js'

// Shared between components so the demo expenses are only fetched once.
let seeding = null

/** Look up each demo expense's rate for the day it was paid, then save them all. */
async function seedDemoExpenses() {
  const { trips } = getAppData()

  const expenses = await Promise.all(
    demoExpenseDrafts.map(async (draft, index) => {
      const trip = trips.find((candidate) => candidate.id === draft.tripId)
      const { rate, rateDate } = await getRate(draft.currency, trip.homeCurrency, draft.date)
      return { ...draft, id: `demo-${index + 1}`, rate, rateDate, createdAt: index }
    }),
  )

  // We only get here if every rate arrived. Nothing is saved without a rate.
  addExpenses(expenses)
  markDemoSeeded()
}

/**
 * Adds the demo expenses the first time the app runs.
 * Returns { status, retry } where status is 'loading', 'error' or 'ready'.
 * 'error' means Frankfurter could not be reached, so nothing was saved.
 */
export function useDemoSeed() {
  const { demoSeeded } = useAppData()
  const [failed, setFailed] = useState(false)

  // Start fetching, unless another component already has.
  const start = useCallback(() => {
    seeding ??= seedDemoExpenses().finally(() => {
      seeding = null
    })
    seeding.catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    if (!demoSeeded) start()
  }, [demoSeeded, start])

  const retry = useCallback(() => {
    setFailed(false)
    start()
  }, [start])

  if (demoSeeded) return { status: 'ready', retry }
  return { status: failed ? 'error' : 'loading', retry }
}
