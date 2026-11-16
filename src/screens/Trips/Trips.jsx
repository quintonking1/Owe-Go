import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { setCurrentTrip, useAppData } from '../../data/store.js'
import { formatDateRange, formatMonthShort, todayIso } from '../../lib/dates.js'
import { formatMoney } from '../../lib/money.js'
import { computeBalances } from '../../logic/balances.js'
import './Trips.css'

function travelerCount(trip) {
  const count = trip.travelerIds.length
  return `${count} ${count === 1 ? 'traveler' : 'travelers'}`
}

/**
 * Trips tab: the trip you're on now, your other trips, and "+" to start one.
 * Tapping any trip makes it the current trip and opens Home.
 */
export function Trips() {
  const { currentUserId, currentTripId, trips, expenses, payments } = useAppData()
  const today = todayIso()

  const current = trips.find((trip) => trip.id === currentTripId)
  const others = trips.filter((trip) => trip.id !== currentTripId)
  const past = others.filter((trip) => trip.endDate < today)
  const notPast = others.filter((trip) => trip.endDate >= today)

  return (
    <Screen>
      <main className="trips">
        <div className="trips__header">
          <h1 className="trips__title">Trips</h1>
          <Link className="trips__new" to="/trips/new" aria-label="New trip">
            <Icon name="plus" size={20} strokeWidth={2.25} />
          </Link>
        </div>

        {current ? (
          <section className="trips__section" aria-labelledby="current-trip-heading">
            <h2 className="trips__section-title" id="current-trip-heading">
              Current trip
            </h2>
            <CurrentTripCard trip={current} expenses={expenses} payments={payments} currentUserId={currentUserId} />
          </section>
        ) : (
          <p className="trips__meta">No trips yet. Tap + to start one.</p>
        )}

        <TripList title="Other trips" trips={notPast} />
        <TripList title="Past trips" trips={past} />
      </main>
      <TabBar />
    </Screen>
  )
}

/** The big card for the current trip: photo, dates, travelers and your balance. */
function CurrentTripCard({ trip, expenses, payments, currentUserId }) {
  const tripExpenses = expenses.filter((expense) => expense.tripId === trip.id)
  const net = computeBalances(
    tripExpenses,
    trip.travelerIds,
    trip.homeCurrency,
    payments.filter((payment) => payment.tripId === trip.id),
  ).get(currentUserId)?.net ?? 0

  let balanceLabel = 'settled'
  if (net < 0) balanceLabel = 'you owe'
  if (net > 0) balanceLabel = 'you are owed'

  return (
    <Link className="trips__card" to="/">
      {trip.photo ? (
        <img className="trips__photo" src={trip.photo} alt="" />
      ) : (
        <div className="trips__photo trips__photo--empty" />
      )}
      <div className="trips__card-details">
        <div className="trips__card-text">
          <span className="trips__card-name">{trip.name}</span>
          <p className="trips__meta">
            {formatDateRange(trip.startDate, trip.endDate)} · {travelerCount(trip)}
          </p>
        </div>
        {tripExpenses.length > 0 && (
          <div className="trips__balance">
            {/* Neutral black, like Home. Your own balance is never red. */}
            <span className="trips__balance-amount mono">
              {formatMoney(net, trip.homeCurrency, { showPlus: true })}
              {net !== 0 && (
                <span className="trips__balance-arrow">
                  <Icon name={net < 0 ? 'arrow-down' : 'arrow-up'} size={13} strokeWidth={2.25} />
                </span>
              )}
            </span>
            <span className="trips__balance-label">{balanceLabel}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

/** A titled list of smaller trip rows. Shows nothing when the list is empty. */
function TripList({ title, trips }) {
  if (trips.length === 0) return null
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-heading`

  return (
    <>
      <hr className="trips__rule" />
      <section className="trips__section" aria-labelledby={headingId}>
        <h2 className="trips__section-title" id={headingId}>
          {title}
        </h2>
        <ul className="trips__list">
          {trips.map((trip) => (
            <li key={trip.id}>
              {/* Choosing a trip makes it current, then the link opens Home. */}
              <Link className="trips__row" to="/" onClick={() => setCurrentTrip(trip.id)}>
                {trip.photo ? (
                  <img className="trips__thumb" src={trip.photo} alt="" />
                ) : (
                  <span className="trips__thumb trips__thumb--empty" />
                )}
                <span className="trips__row-text">
                  <span className="trips__row-name">{trip.name}</span>
                  <span className="trips__meta">
                    {formatMonthShort(trip.startDate)} · {travelerCount(trip)}
                  </span>
                </span>
                <span className="trips__row-chevron">
                  <Icon name="chevron-right" size={18} strokeWidth={1.75} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
