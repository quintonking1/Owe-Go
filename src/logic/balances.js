import { convertToHome } from '../lib/money.js'
import { splitEqually } from './split.js'

/** An expense's amount in the home currency, using the rate from the day it was paid. */
export function homeAmount(expense, homeCurrency) {
  return convertToHome(expense.amount, expense.currency, expense.rate, homeCurrency)
}

/**
 * Work out where each traveler stands, in home-currency cents.
 *
 * Returns a Map of person id -> { paid, share, sent, received, net }:
 *   paid      what they paid for the group's expenses
 *   share     their part of every expense they were in
 *   sent      settle-up payments they've made
 *   received  settle-up payments they've been paid
 *   net       paid - share + sent - received. Above zero they are owed
 *             money, below zero they owe.
 *
 * Each expense's shares add up to its total exactly, and each payment adds
 * to one person what it takes from another, so the nets always sum to zero.
 */
export function computeBalances(expenses, travelerIds, homeCurrency, payments = []) {
  const balances = new Map()
  const balanceFor = (id) => {
    if (!balances.has(id)) balances.set(id, { paid: 0, share: 0, sent: 0, received: 0, net: 0 })
    return balances.get(id)
  }
  travelerIds.forEach(balanceFor)

  for (const expense of expenses) {
    const total = homeAmount(expense, homeCurrency)
    balanceFor(expense.paidById).paid += total

    const shares = splitEqually(total, expense.splitBetweenIds, expense.paidById)
    for (const [id, share] of shares) balanceFor(id).share += share
  }

  for (const payment of payments) {
    balanceFor(payment.fromId).sent += payment.amount
    balanceFor(payment.toId).received += payment.amount
  }

  for (const balance of balances.values()) {
    balance.net = balance.paid - balance.share + balance.sent - balance.received
  }
  return balances
}
