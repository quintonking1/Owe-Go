import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AvatarStack } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { ExpenseRow } from '../../components/ExpenseRow/ExpenseRow.jsx'
import { FloatingButton } from '../../components/FloatingButton/FloatingButton.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { useDemoSeed } from '../../data/demo.js'
import { DEMO_TRIP_ID } from '../../data/seed.js'
import { useCurrentTrip } from '../../data/useCurrentTrip.js'
import { formatDateRange, formatShortDate } from '../../lib/dates.js'
import { formatMoney } from '../../lib/money.js'
import { computeBalances, homeAmount } from '../../logic/balances.js'
import { EmptyTrip } from '../shared/EmptyTrip.jsx'
import { TripPhotoButton, TripPhotoError } from './TripPhotoButton.jsx'
import './TripHome.css'

/** How many expenses "Recent charges" shows. "See all" opens the full list. */
const RECENT_COUNT = 10

/**
 * Home: the current trip, your balance and the most recent charges.
 * Every number on this screen is worked out from the saved expenses.
 */
export function TripHome() {
  const { trip, travelers, tripExpenses, tripPayments, currentUserId, nameOf } = useCurrentTrip()
  const demo = useDemoSeed()

  if (!trip) return <NoTrip />

  const myBalance = computeBalances(tripExpenses, trip.travelerIds, trip.homeCurrency, tripPayments).get(
    currentUserId,
  )

  // Newest first. Expenses paid on the same day keep the order they were added in.
  const recent = [...tripExpenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, RECENT_COUNT)

  const hasExpenses = tripExpenses.length > 0

  return (
    <Screen>
      <TripHeader key={trip.id} trip={trip} travelers={travelers} />

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
        // Only the demo trip waits on demo expenses. A trip you just made is simply empty.
        <main>
          <EmptyTrip status={trip.id === DEMO_TRIP_ID ? demo.status : 'ready'} onRetry={demo.retry} />
        </main>
      )}

      {hasExpenses && <FloatingButton to="/expenses/new">Add expense</FloatingButton>}
      <TabBar />
    </Screen>
  )
}

/** Trip photo with the trip switcher and travelers over it, then the trip name and dates. */
function TripHeader({ trip, travelers }) {
  const [photoStatus, setPhotoStatus] = useState({ state: 'idle' })
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

        <TripPhotoButton trip={trip} status={photoStatus} onStatus={setPhotoStatus} />
      </div>

      <div className="trip-home__heading">
        <h1 className="trip-home__title">{trip.name}</h1>
        <p className="trip-home__dates">
          {formatDateRange(trip.startDate, trip.endDate)} · {trip.homeCurrency}
        </p>
        <TripPhotoError status={photoStatus} />
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

/** Shown if there is no current trip at all. */
function NoTrip() {
  return (
    <Screen>
      <main className="empty-trip">
        <h1 className="empty-trip__title">No trip yet</h1>
        <p className="empty-trip__text">Start a trip to begin logging expenses.</p>
        <div className="empty-trip__action">
          <Button variant="primary" to="/trips">
            Go to trips
          </Button>
        </div>
      </main>
      <TabBar />
    </Screen>
  )
}
