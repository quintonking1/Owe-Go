import { Link } from 'react-router-dom'
import { Collapsible } from '../../components/Collapsible/Collapsible.jsx'
import { formatShortDate } from '../../lib/dates.js'
import { formatMoney } from '../../lib/money.js'
import { homeAmount } from '../../logic/balances.js'
import { splitEqually } from '../../logic/split.js'
import './Breakdown.css'

/** How many expenses the breakdown lists before "N more expenses". */
const SHOWN = 6

/**
 * "How we got $X": your share of each expense, minus what you've already
 * paid, so you can check the number. Starts collapsed. Every line comes from
 * the real expense log and payments.
 *
 * Props:
 * - trip, expenses, balance (yours, from computeBalances), currentUserId, nameOf
 * - plan: your outstanding payments, as { fromId, toId }
 */
export function Breakdown({ trip, expenses, balance, currentUserId, nameOf, plan }) {
  const currency = trip.homeCurrency
  const money = (amount) => formatMoney(amount, currency)

  // Your share of each expense you were in, newest first.
  const shares = expenses
    .filter((expense) => expense.splitBetweenIds.includes(currentUserId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .map((expense) => {
      const total = homeAmount(expense, currency)
      const share = splitEqually(total, expense.splitBetweenIds, expense.paidById).get(currentUserId)
      return { expense, share }
    })

  const shown = shares.slice(0, SHOWN)
  const rest = shares.slice(SHOWN)
  const restTotal = rest.reduce((sum, row) => sum + row.share, 0)

  const owe = balance.net < 0
  const net = Math.abs(balance.net)

  // Why it's the number of payments it is.
  const paying = plan.filter((payment) => payment.fromId === currentUserId)
  const receiving = plan.filter((payment) => payment.toId === currentUserId)
  let note = ''
  if (paying.length === 1) {
    note = `We combine everything into one payment to ${nameOf(paying[0].toId)}, so you only pay one person.`
  } else if (paying.length > 1) {
    note = `You pay ${paying.length} people. That's the fewest payments that settle the whole group.`
  } else if (receiving.length === 1) {
    note = `It all comes to you as one payment from ${nameOf(receiving[0].fromId)}.`
  } else if (receiving.length > 1) {
    note = `It comes to you in ${receiving.length} payments, the fewest that settle the whole group.`
  }

  return (
    <div className="breakdown">
      <Collapsible title={`How we got ${money(net)}`}>
        <div className="breakdown__content">
          <span className="breakdown__heading">Your share of each expense</span>
          <ul>
            {shown.map(({ expense, share }) => (
              <li key={expense.id} className="breakdown__row">
                <span className="breakdown__row-text">
                  <span className="breakdown__row-title">{expense.title}</span>
                  <span className="breakdown__row-meta">
                    {formatShortDate(expense.date)} · {nameOf(expense.paidById)} paid · split{' '}
                    {expense.splitBetweenIds.length}
                  </span>
                </span>
                <span className="breakdown__row-amount mono">{money(share)}</span>
              </li>
            ))}
            {rest.length > 0 && (
              <li className="breakdown__row">
                <Link className="breakdown__more" to="/expenses">
                  {rest.length} more {rest.length === 1 ? 'expense' : 'expenses'}
                </Link>
                <span className="breakdown__row-amount mono">{money(restTotal)}</span>
              </li>
            )}
          </ul>

          <dl className="breakdown__sums">
            <div className="breakdown__sum">
              <dt>
                Your share of {shares.length} {shares.length === 1 ? 'expense' : 'expenses'}
              </dt>
              <dd className="mono">{money(balance.share)}</dd>
            </div>
            <div className="breakdown__sum">
              <dt>You already paid</dt>
              <dd className="mono">{money(-balance.paid)}</dd>
            </div>
            {balance.sent > 0 && (
              <div className="breakdown__sum">
                <dt>Payments you made</dt>
                <dd className="mono">{money(-balance.sent)}</dd>
              </div>
            )}
            {balance.received > 0 && (
              <div className="breakdown__sum">
                <dt>Payments you received</dt>
                <dd className="mono">{money(balance.received)}</dd>
              </div>
            )}
            <div className="breakdown__sum breakdown__sum--total">
              <dt>{owe ? 'You owe' : 'You are owed'}</dt>
              <dd className="mono">{money(net)}</dd>
            </div>
          </dl>

          {note && <p className="breakdown__note">{note}</p>}
        </div>
      </Collapsible>
    </div>
  )
}
