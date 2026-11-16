import { Navigate } from 'react-router-dom'
import { ExpenseRow } from '../../components/ExpenseRow/ExpenseRow.jsx'
import { FloatingButton } from '../../components/FloatingButton/FloatingButton.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { useDemoSeed } from '../../data/demo.js'
import { DEMO_TRIP_ID } from '../../data/seed.js'
import { useCurrentTrip } from '../../data/useCurrentTrip.js'
import { formatShortDate } from '../../lib/dates.js'
import { formatMoney } from '../../lib/money.js'
import { homeAmount } from '../../logic/balances.js'
import { EmptyTrip } from '../shared/EmptyTrip.jsx'
import './Expenses.css'

/**
 * Expenses tab: every expense on the current trip, newest day first, with
 * the trip total. The total and each amount are worked out from the saved
 * expenses and the rate stored with each one.
 */
export function Expenses() {
  const { trip, tripExpenses, nameOf } = useCurrentTrip()
  const demo = useDemoSeed()

  if (!trip) return <Navigate to="/" replace />

  const total = tripExpenses.reduce((sum, expense) => sum + homeAmount(expense, trip.homeCurrency), 0)
  const count = `${tripExpenses.length} ${tripExpenses.length === 1 ? 'expense' : 'expenses'}`
  const city = trip.destination.split(',')[0]

  // Newest first, then gathered into one group per day.
  const sorted = [...tripExpenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  const days = []
  for (const expense of sorted) {
    const lastDay = days[days.length - 1]
    if (lastDay?.date === expense.date) lastDay.expenses.push(expense)
    else days.push({ date: expense.date, expenses: [expense] })
  }

  const hasExpenses = tripExpenses.length > 0

  return (
    <Screen>
      <main className="expenses">
        <h1 className="expenses__title">Expenses</h1>
        <div className="expenses__summary">
          <p className="expenses__count">
            {city} · {count}
          </p>
          {hasExpenses && (
            <span className="expenses__total mono">
              <span className="visually-hidden">Trip total </span>
              {formatMoney(total, trip.homeCurrency)}
            </span>
          )}
        </div>

        {hasExpenses ? (
          // The list scrolls, and fades out before it reaches the Add expense button.
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          <div className="expenses__list" role="region" aria-label="All expenses" tabIndex={0}>
            {days.map((day) => (
              <section key={day.date} aria-label={formatShortDate(day.date)}>
                <h2 className="expenses__day">{formatShortDate(day.date)}</h2>
                <ul>
                  {day.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      currency={expense.currency}
                      title={expense.title}
                      meta={`${nameOf(expense.paidById)} paid · split ${expense.splitBetweenIds.length}`}
                      homeAmount={formatMoney(homeAmount(expense, trip.homeCurrency), trip.homeCurrency)}
                      originalAmount={formatMoney(expense.amount, expense.currency)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <EmptyTrip status={trip.id === DEMO_TRIP_ID ? demo.status : 'ready'} onRetry={demo.retry} />
        )}
      </main>

      {hasExpenses && <FloatingButton to="/expenses/new">Add expense</FloatingButton>}
      <TabBar />
    </Screen>
  )
}
