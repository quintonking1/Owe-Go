import { Navigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import { useCurrentTrip } from '../../data/useCurrentTrip.js'
import { formatMoney } from '../../lib/money.js'
import { computeBalances } from '../../logic/balances.js'
import { suggestPayments } from '../../logic/settle.js'
import { tripSubtitle } from '../shared/tripSubtitle.js'
import './Balances.css'

/**
 * Balances: what each traveler paid, the currencies they paid in, and where
 * they stand. Every number comes from the saved expenses and payments, and
 * the nets always add up to zero.
 */
export function Balances() {
  const { trip, travelers, tripExpenses, tripPayments, currentUserId } = useCurrentTrip()
  if (!trip) return <Navigate to="/" replace />

  const currency = trip.homeCurrency
  const balances = computeBalances(tripExpenses, trip.travelerIds, currency, tripPayments)
  const left = suggestPayments(balances).length

  // Most owed first, then down to whoever owes the most.
  const rows = travelers
    .map((person) => ({ person, balance: balances.get(person.id) }))
    .sort((a, b) => b.balance.net - a.balance.net || a.person.name.localeCompare(b.person.name))

  const netSum = [...balances.values()].reduce((sum, balance) => sum + balance.net, 0)

  /** What a person paid, totalled per currency: "¥45,200 · €72.50". */
  function paidIn(personId) {
    const totals = new Map()
    for (const expense of tripExpenses) {
      if (expense.paidById !== personId) continue
      totals.set(expense.currency, (totals.get(expense.currency) ?? 0) + expense.amount)
    }
    return [...totals].map(([code, amount]) => formatMoney(amount, code)).join(' · ')
  }

  return (
    <Screen>
      <TopBar action="back" actionLabel="Back to home" to="/" title="Balances" subtitle={tripSubtitle(trip)} />

      <main className="balances">
        <ul>
          {rows.map(({ person, balance }) => {
            const isYou = person.id === currentUserId
            const currencies = paidIn(person.id)

            let tone = 'even'
            let label = 'settled'
            if (balance.net > 0) {
              tone = 'owed'
              label = isYou ? 'are owed' : 'is owed'
            } else if (balance.net < 0) {
              tone = 'owes'
              label = isYou ? 'owe' : 'owes'
            }

            return (
              <li key={person.id} className="balances__row">
                <Avatar name={person.initial} color={person.color} size="lg" />
                <div className="balances__who">
                  <span className="balances__name">{person.name}</span>
                  <span className="balances__paid">Paid {formatMoney(balance.paid, currency)}</span>
                  {currencies && <span className="balances__currencies mono">{currencies}</span>}
                </div>
                <div className="balances__net">
                  <span className={`balances__amount balances__amount--${tone} mono`}>
                    {formatMoney(balance.net, currency, { showPlus: true })}
                    {tone !== 'even' && (
                      <Icon name={tone === 'owed' ? 'arrow-up' : 'arrow-down'} size={14} strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="balances__label">{label}</span>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="balances__sum">
          <span>Nets add up to</span>
          <span className="mono">{formatMoney(netSum, currency)}</span>
        </div>

        <p className="balances__note">
          Net is what each person paid minus their share of every expense they were in.
          {tripPayments.length > 0 && ' Payments marked paid on Settle up count too.'} All amounts in {currency}.
        </p>
      </main>

      <footer className="balances__footer">
        <div className="balances__footer-text">
          {left > 0 ? (
            <>
              <span className="balances__footer-count">
                {left} {left === 1 ? 'payment' : 'payments'}
              </span>
              <span className="balances__footer-label">settle this trip</span>
            </>
          ) : (
            <>
              <span className="balances__footer-count">All settled</span>
              <span className="balances__footer-label">Nothing left to pay</span>
            </>
          )}
        </div>
        <Button variant="primary" to="/settle">
          Settle up
        </Button>
      </footer>
    </Screen>
  )
}
