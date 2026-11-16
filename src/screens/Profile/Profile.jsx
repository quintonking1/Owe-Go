import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.jsx'
import { CurrencyPicker } from '../../components/CurrencyPicker/CurrencyPicker.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { CURRENCIES } from '../../data/currencies.js'
import { PAYMENT_METHODS } from '../../data/paymentMethods.js'
import { updatePreferences, useAppData } from '../../data/store.js'
import { computeBalances } from '../../logic/balances.js'
import './Profile.css'

/** "5105550100" → "(510) 555-0100". Anything else is shown as it is. */
function formatPhone(phone = '') {
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** A trip is settled once it has expenses and everyone's balance is back to zero. */
function isSettled(trip, expenses, payments) {
  const tripExpenses = expenses.filter((expense) => expense.tripId === trip.id)
  if (tripExpenses.length === 0) return false
  const balances = computeBalances(
    tripExpenses,
    trip.travelerIds,
    trip.homeCurrency,
    payments.filter((payment) => payment.tripId === trip.id),
  )
  return [...balances.values()].every((balance) => balance.net === 0)
}

/**
 * Profile tab: who you are, counts across your trips, your preferences and
 * your friends. Every count is worked out from stored data.
 */
export function Profile() {
  const { currentUserId, people, trips, expenses, payments, preferences } = useAppData()
  const [choosingMethod, setChoosingMethod] = useState(false)

  const me = people.find((person) => person.id === currentUserId)
  const friends = people.filter((person) => person.friend && person.id !== currentUserId)
  const myTrips = trips.filter((trip) => trip.travelerIds.includes(currentUserId))
  const settledCount = myTrips.filter((trip) => isSettled(trip, expenses, payments)).length
  const method = PAYMENT_METHODS.find((option) => option.id === preferences.paymentMethod) ?? PAYMENT_METHODS[0]

  const stats = [
    { label: 'Trips', value: myTrips.length },
    { label: 'Friends', value: friends.length },
    { label: 'Settled', value: settledCount },
  ]

  return (
    <Screen>
      <main className="profile">
        <h1 className="profile__title">Profile</h1>

        <section className="profile__account" aria-label="Your account">
          <Avatar name={me.name} color={me.color} className="profile__avatar" />
          <div className="profile__identity">
            <span className="profile__name">{me.name}</span>
            <span className="profile__phone mono">{formatPhone(me.phone)}</span>
          </div>
          <Link className="profile__edit" to="/profile/edit">
            Edit
          </Link>
        </section>

        <section className="profile__stats" aria-label="Trip stats">
          {stats.map((stat) => (
            <div key={stat.label} className="profile__stat">
              <span className="profile__stat-value mono">{stat.value}</span>
              <span className="profile__stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="profile__section" aria-labelledby="preferences-heading">
          <h2 className="profile__section-title" id="preferences-heading">
            Preferences
          </h2>
          <div className="profile__group">
            <div className="profile__row profile__row--picker">
              <CurrencyPicker
                variant="field"
                label="Default home currency"
                currencies={CURRENCIES}
                value={preferences.homeCurrency}
                onChange={(homeCurrency) => updatePreferences({ homeCurrency })}
              />
            </div>

            <button
              type="button"
              className="profile__row profile__row--button"
              aria-haspopup="dialog"
              onClick={() => setChoosingMethod(true)}
            >
              <span className="profile__row-text">
                <span className="profile__row-label">Payment method</span>
                <span className="profile__row-value">{method.name}</span>
              </span>
              <span className="profile__chevron">
                <Icon name="chevron-right" size={18} strokeWidth={1.75} />
              </span>
            </button>

            <SwitchRow
              id="pref-new-expense"
              title="New expense alerts"
              description="When someone adds you to an expense"
              checked={preferences.newExpenseAlerts}
              onChange={(newExpenseAlerts) => updatePreferences({ newExpenseAlerts })}
            />
            <SwitchRow
              id="pref-reminders"
              title="Gentle payment reminders"
              description="A friendly nudge when you owe someone"
              checked={preferences.paymentReminders}
              onChange={(paymentReminders) => updatePreferences({ paymentReminders })}
            />
          </div>
        </section>

        <section className="profile__section" aria-labelledby="friends-heading">
          <div className="profile__section-header">
            <h2 className="profile__section-title" id="friends-heading">
              Friends
            </h2>
            <Link className="profile__link profile__link--sm" to="/travelers">
              Invite
            </Link>
          </div>
          {friends.length > 0 ? (
            <ul className="profile__friends">
              {friends.map((friend) => (
                <li key={friend.id} className="profile__friend">
                  <Avatar name={friend.name} color={friend.color} size="lg" />
                  <span className="profile__friend-name">{friend.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile__muted">No friends yet. Invite someone by phone number.</p>
          )}
        </section>

        <div className="profile__footer">
          <Link className="profile__link" to="/help">
            Help and feedback
          </Link>
          <Link className="profile__link" to="/logout">
            Log out
          </Link>
          <span className="profile__muted profile__build">Owe &amp; Go · demo build</span>
        </div>
      </main>
      <TabBar />

      <BottomSheet open={choosingMethod} onClose={() => setChoosingMethod(false)} title="Payment method">
        <div className="profile__methods" role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map((option) => {
            const selected = option.id === method.id
            return (
              <button
                type="button"
                key={option.id}
                className="profile__method"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  updatePreferences({ paymentMethod: option.id })
                  setChoosingMethod(false)
                }}
              >
                <span className="profile__method-tag mono">{option.tag}</span>
                <span className="profile__method-name">{option.name}</span>
                {selected && (
                  <span className="profile__method-check">
                    <Icon name="check" size={16} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </Screen>
  )
}

/** A preference row with an on/off switch. The title names the switch. */
function SwitchRow({ id, title, description, checked, onChange }) {
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  return (
    <div className="profile__row">
      <span className="profile__row-text">
        <span className="profile__row-title" id={titleId}>
          {title}
        </span>
        <span className="profile__row-description" id={descriptionId}>
          {description}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        className="profile__switch"
        aria-checked={checked}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
      >
        <span className="profile__switch-thumb" aria-hidden="true" />
      </button>
    </div>
  )
}
