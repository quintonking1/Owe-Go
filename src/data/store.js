import { useSyncExternalStore } from 'react'
import { initialData } from './seed.js'

/**
 * All app data lives in one localStorage entry. There is no backend.
 * Components read it with useAppData() and re-render when it changes.
 */
const STORAGE_KEY = 'oweandgo:data:v2'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    // Fill in anything older saved data is missing, such as `payments`.
    if (saved) return { ...initialData, ...JSON.parse(saved) }
  } catch {
    // Unreadable data: start again from the demo data.
  }
  return initialData
}

let data = load()
const listeners = new Set()

function save(next) {
  data = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked: keep working in memory for this visit.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Read the app data, and re-render whenever it changes. */
export function useAppData() {
  return useSyncExternalStore(subscribe, () => data)
}

/** Read the app data once, outside a component. */
export function getAppData() {
  return data
}

/** Save new expenses. Every expense must already have its rate. */
export function addExpenses(expenses) {
  if (expenses.some((expense) => typeof expense.rate !== 'number')) {
    throw new Error('An expense can not be saved without a rate.')
  }
  save({ ...data, expenses: [...data.expenses, ...expenses] })
}

/**
 * Save one new expense. Pass everything except id and createdAt:
 * { tripId, title, date, amount, currency, rate, rateDate, paidById, splitBetweenIds }.
 */
export function addExpense(details) {
  const now = Date.now()
  addExpenses([{ ...details, id: `expense-${now}`, createdAt: now }])
}

/**
 * Record a settle-up payment as paid. Pass { tripId, fromId, toId, amount,
 * method, date }. amount is in the trip's home-currency cents.
 */
export function addPayment(details) {
  const now = Date.now()
  const payment = { ...details, id: `payment-${now}`, createdAt: now }
  save({ ...data, payments: [...data.payments, payment] })
}

/** Remove the most recent payment on a trip ("Undo last payment"). */
export function undoLastPayment(tripId) {
  const onTrip = data.payments.filter((payment) => payment.tripId === tripId)
  const last = onTrip.reduce((latest, payment) => (payment.createdAt > (latest?.createdAt ?? -1) ? payment : latest), null)
  if (!last) return
  save({ ...data, payments: data.payments.filter((payment) => payment.id !== last.id) })
}

/**
 * Save a new trip and make it the current one. Returns the saved trip.
 * Pass everything except the id: { name, destination, startDate, endDate,
 * homeCurrency, localCurrency, travelerIds }.
 */
export function addTrip(details) {
  const trip = { photo: null, ...details, id: `trip-${Date.now()}` }
  save({ ...data, trips: [...data.trips, trip], currentTripId: trip.id })
  return trip
}

/**
 * Set or replace a trip's photo. `photo` is an image data URL, or null to
 * remove it. Photos are big, so unlike other saves this one checks that
 * localStorage really took it, and throws (changing nothing) if it didn't.
 */
export function setTripPhoto(tripId, photo) {
  const next = {
    ...data,
    trips: data.trips.map((trip) => (trip.id === tripId ? { ...trip, photo } : trip)),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('The photo could not be saved on this device.')
  }
  data = next
  listeners.forEach((listener) => listener())
}

/** Choose which trip Home and the other tabs show. */
export function setCurrentTrip(tripId) {
  save({ ...data, currentTripId: tripId })
}

/** Change some of your Profile preferences, e.g. updatePreferences({ homeCurrency: 'EUR' }). */
export function updatePreferences(changes) {
  save({ ...data, preferences: { ...initialData.preferences, ...data.preferences, ...changes } })
}

export function markDemoSeeded() {
  save({ ...data, demoSeeded: true })
}

/**
 * Put the app back to how it starts. With { withDemoExpenses: false } the
 * trip starts with no expenses, which shows the empty Home screen.
 */
export function resetAppData({ withDemoExpenses = true } = {}) {
  save({ ...initialData, demoSeeded: !withDemoExpenses })
}
