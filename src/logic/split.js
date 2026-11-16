/**
 * Split a total equally between the chosen people.
 *
 * `total` is in home-currency cents. When it doesn't divide evenly, the
 * leftover cents go to the payer, so the shares always add up to the total.
 * (If the payer isn't in the split, the first person in it takes the leftover.)
 *
 * Returns a Map of person id -> their share in cents.
 */
export function splitEqually(total, splitBetweenIds, paidById) {
  const shares = new Map()
  if (splitBetweenIds.length === 0) return shares

  const base = Math.floor(total / splitBetweenIds.length)
  const leftover = total - base * splitBetweenIds.length
  for (const id of splitBetweenIds) shares.set(id, base)

  const leftoverId = splitBetweenIds.includes(paidById) ? paidById : splitBetweenIds[0]
  shares.set(leftoverId, base + leftover)
  return shares
}
