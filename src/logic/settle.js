/**
 * Suggest the payments that settle a trip, using as few as possible.
 *
 * Takes the Map from computeBalances. Repeatedly matches the person who owes
 * the most with the person owed the most, and has one pay the other the
 * smaller of the two amounts. For a small group this gives the fewest payments.
 *
 * Returns a list of { fromId, toId, amount } with amount in home-currency
 * cents, largest first.
 */
export function suggestPayments(balances) {
  // Ties are broken by id, so the same balances always give the same plan.
  const byAmount = (a, b) => b.amount - a.amount || a.id.localeCompare(b.id)

  const owes = []
  const owed = []
  for (const [id, { net }] of balances) {
    if (net < 0) owes.push({ id, amount: -net })
    if (net > 0) owed.push({ id, amount: net })
  }

  const payments = []
  while (owes.length > 0 && owed.length > 0) {
    owes.sort(byAmount)
    owed.sort(byAmount)
    const debtor = owes[0]
    const creditor = owed[0]
    const amount = Math.min(debtor.amount, creditor.amount)

    payments.push({ fromId: debtor.id, toId: creditor.id, amount })
    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount === 0) owes.shift()
    if (creditor.amount === 0) owed.shift()
  }

  return payments.sort((a, b) => b.amount - a.amount)
}
