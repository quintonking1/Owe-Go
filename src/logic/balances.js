import { convertToHome } from '../lib/money.js'
import { splitEqually } from './split.js'

/** An expense's amount in the home currency, using the rate from the day it was paid. */
export function homeAmount(expense, homeCurrency) {
  return convertToHome(expense.amount, expense.currency, expense.rate, homeCurrency)
}

/**
 * Work out where each traveler stands, in home-currency cents.
 *
 * Returns a Map of person id -> { paid, share, net }:
 *   paid   what they paid for the group
 *   share  their part of every expense they were in
 *   net    paid minus share. Above zero they are owed money, below zero they owe.
 *
 * Each expense's shares add up to its total exactly, so the nets across the
 * whole group always add up to zero.
 */
export function computeBalances(expenses, travelerIds, homeCurrency) {
  const balances = new Map()
  const balanceFor = (id) => {
    if (!balances.has(id)) balances.set(id, { paid: 0, share: 0, net: 0 })
    return balances.get(id)
  }
  travelerIds.forEach(balanceFor)

  for (const expense of expenses) {
    const total = homeAmount(expense, homeCurrency)
    balanceFor(expense.paidById).paid += total

    const shares = splitEqually(total, expense.splitBetweenIds, expense.paidById)
    for (const [id, share] of shares) balanceFor(id).share += share
  }

  for (const balance of balances.values()) balance.net = balance.paid - balance.share
  return balances
}
