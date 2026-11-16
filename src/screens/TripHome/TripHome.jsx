import { Link } from 'react-router-dom'
import { Alert } from '../../components/Alert/Alert.jsx'
import { AvatarStack } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { ExpenseRow } from '../../components/ExpenseRow/ExpenseRow.jsx'
import { FloatingButton } from '../../components/FloatingButton/FloatingButton.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { useDemoSeed } from '../../data/demo.js'
import { useAppData } from '../../data/store.js'
import { formatDateRange, formatShortDate } from '../../lib/dates.js'
import { formatMoney } from '../../lib/money.js'
import { computeBalances, homeAmount } from '../../logic/balances.js'
import './TripHome.css'

/** How many expenses "Recent charges" shows. "See all" opens the full list. */
const RECENT_COUNT = 10

/**
 * Home: the current trip, your balance and the most recent charges.
 * Every number on this screen is worked out from the saved expenses.
 */
export function TripHome() {
  const { currentUserId, currentTripId, people, trips, expenses } = useAppData()
  const demo = useDemoSeed()

  const trip = trips.find((candidate) => candidate.id === currentTripId)
  if (!trip) return <NoTrip />

  // The current user shows as "You", but keeps their own initial on the avatar.
  const nameOf = (id) => {
    if (id === currentUserId) return 'You'
    return people.find((person) => person.id === id)?.name ?? 'Someone'
  }
  const travelers = trip.travelerIds
    .map((id) => people.find((person) => person.id === id))
    .filter(Boolean)
    .map((person) => ({ ...person, initial: person.name, name: nameOf(person.id) }))

  const tripExpenses = expenses.filter((expense) => expense.tripId === trip.id)
  const myBalance = computeBalances(tripExpenses, trip.travelerIds, trip.homeCurrency).get(currentUserId)

  // Newest first. Expenses paid on the same day keep the order they were added in.
  const recent = [...tripExpenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, RECENT_COUNT)

  const hasExpenses = tripExpenses.length > 0

  return (
    <Screen>
      <TripHeader trip={trip} travelers={travelers} />

      {hasExpenses ? (
        <main className="trip-home__main">
          <BalanceCard net={myBalance?.net ?? 0} currency={trip.homeCurrency} />

          <section className="trip-home__recent" aria-labelledby="recent-heading">
            <div className="trip-home__recent-header">
              <h2 className="trip-home__recent-title" id="recent-heading">
                Recent charges
              </h2>
              <Button variant="link" size="md" to="/expenses">
                See all
              </Button>
            </div>

            {/* The list scrolls, and fades out before it reaches the Add expense button. */}
            {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <div className="trip-home__list" role="region" aria-label="Recent charges" tabIndex={0}>
              <ul>
                {recent.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    size="compact"
                    currency={expense.currency}
                    title={expense.title}
                    meta={`${formatShortDate(expense.date)} · ${nameOf(expense.paidById)} paid · split ${expense.splitBetweenIds.length}`}
                    homeAmount={formatMoney(homeAmount(expense, trip.homeCurrency), trip.homeCurrency)}
                    originalAmount={formatMoney(expense.amount, expense.currency)}
                  />
                ))}
              </ul>
            </div>
          </section>
        </main>
      ) : (
        <EmptyTrip status={demo.status} onRetry={demo.retry} />
      )}

      {hasExpenses && <FloatingButton to="/expenses/new">Add expense</FloatingButton>}
      <TabBar />
    </Screen>
  )
}

/** Trip photo with the trip switcher and travelers over it, then the trip name and dates. */
function TripHeader({ trip, travelers }) {
  const city = trip.destination.split(',')[0]
  const names = travelers.map((traveler) => traveler.name).join(', ')
  const count = `${travelers.length} ${travelers.length === 1 ? 'traveler' : 'travelers'}`

  return (
    <header>
      <div className="trip-home__hero">
        {trip.photo ? (
          <img className="trip-home__photo" src={trip.photo} alt="" />
        ) : (
          <div className="trip-home__photo trip-home__photo--empty" />
        )}

        <Link className="trip-home__switcher" to="/trips" aria-label={`${city} trip. Switch trip`}>
          {city} trip
          <Icon name="chevron-down" size={14} strokeWidth={2} />
        </Link>

        <Link className="trip-home__travelers" to="/travelers" aria-label={`${count}: ${names}. Manage travelers`}>
          <AvatarStack people={travelers} size="sm" />
          <span className="trip-home__travelers-count">{count}</span>
        </Link>
      </div>

      <div className="trip-home__heading">
        <h1 className="trip-home__title">{trip.name}</h1>
        <p className="trip-home__dates">
          {formatDateRange(trip.startDate, trip.endDate)} · {trip.homeCurrency}
        </p>
      </div>
    </header>
  )
}

/**
 * Your balance for the trip. The amount is always neutral black with a grey
 * arrow, never red: owing friends is normal, and red reads as an alarm.
 */
function BalanceCard({ net, currency }) {
  let summary = "You're all settled"
  if (net < 0) summary = 'You owe the group'
  if (net > 0) summary = 'The group owes you'

  return (
    <section className="trip-home__card" aria-label="Your balance">
      <div className="trip-home__balance">
        <div className="trip-home__balance-text">
          <span className="trip-home__balance-label">Your balance</span>
          <p className="trip-home__balance-summary">{summary}</p>
        </div>
        <span className="trip-home__balance-amount mono">
          {formatMoney(net, currency, { showPlus: true })}
          {net !== 0 && (
            <span className="trip-home__balance-arrow">
              <Icon name={net < 0 ? 'arrow-down' : 'arrow-up'} size={24} strokeWidth={2.25} />
            </span>
          )}
        </span>
      </div>
      <div className="trip-home__actions">
        <Button variant="dark" size="md" fullWidth to="/settle">
          Settle up
        </Button>
        <Button variant="outline" size="md" fullWidth to="/balances">
          See balances
        </Button>
      </div>
    </section>
  )
}

/** Shown while the trip has no expenses: loading, rates down, or truly empty. */
function EmptyTrip({ status, onRetry }) {
  if (status === 'loading') {
    return (
      <main className="trip-home__empty">
        <p className="trip-home__empty-text" role="status">
          Loading expenses…
        </p>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="trip-home__main">
        <Alert
          title="Rates unavailable"
          action={
            <Button variant="link" size="md" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Could not reach the exchange rate service, so the demo expenses were not added.
        </Alert>
      </main>
    )
  }

  return (
    <main className="trip-home__empty">
      <h2 className="trip-home__empty-title">No expenses yet</h2>
      <p className="trip-home__empty-text">
        Log the first thing someone paid for. Balances fill in as you go.
      </p>
      <div className="trip-home__empty-action">
        <Button variant="primary" to="/expenses/new">
          Add first expense
        </Button>
      </div>
    </main>
  )
}

/** Shown if there is no current trip at all. */
function NoTrip() {
  return (
    <Screen>
      <main className="trip-home__empty">
        <h1 className="trip-home__empty-title">No trip yet</h1>
        <p className="trip-home__empty-text">Start a trip to begin logging expenses.</p>
        <div className="trip-home__empty-action">
          <Button variant="primary" to="/trips">
            Go to trips
          </Button>
        </div>
      </main>
      <TabBar />
    </Screen>
  )
}
