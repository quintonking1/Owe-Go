import { useSyncExternalStore } from 'react'
import { initialData } from './seed.js'

/**
 * All app data lives in one localStorage entry. There is no backend.
 * Components read it with useAppData() and re-render when it changes.
 */
const STORAGE_KEY = 'oweandgo:data:v1'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
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
