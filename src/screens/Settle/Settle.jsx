import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import { addPayment, undoLastPayment } from '../../data/store.js'
import { useCurrentTrip } from '../../data/useCurrentTrip.js'
import { formatMoney } from '../../lib/money.js'
import { computeBalances } from '../../logic/balances.js'
import { suggestPayments } from '../../logic/settle.js'
import { tripSubtitle } from '../shared/tripSubtitle.js'
import { Breakdown } from './Breakdown.jsx'
import { ConfirmPaymentSheet } from './ConfirmPaymentSheet.jsx'
import { PaymentCard } from './PaymentCard.jsx'
import './Settle.css'

/**
 * Settle up: the fewest payments that clear every balance, worked out from
 * the expense log and any payments already marked paid. Once nothing is left
 * to pay, it becomes the "All settled" screen.
 */
export function Settle() {
  const { trip, travelers, tripExpenses, tripPayments, currentUserId, nameOf } = useCurrentTrip()
  // The payment being confirmed, and which method the sheet starts on.
  const [confirming, setConfirming] = useState(null)

  if (!trip) return <Navigate to="/" replace />

  const currency = trip.homeCurrency
  const money = (amount) => formatMoney(amount, currency)
  const personById = (id) => travelers.find((person) => person.id === id) ?? { id, name: nameOf(id), initial: '?', color: 'dinah' }

  const balances = computeBalances(tripExpenses, trip.travelerIds, currency, tripPayments)
  // Payments you make come first, then ones paid to you, then everyone else's.
  const involvement = (payment) => {
    if (payment.fromId === currentUserId) return 0
    if (payment.toId === currentUserId) return 1
    return 2
  }
  const plan = suggestPayments(balances).sort((a, b) => involvement(a) - involvement(b))
  const paid = [...tripPayments].sort((a, b) => a.createdAt - b.createdAt)
  const mine = balances.get(currentUserId)
  const breakdownFor = plan.find((payment) => involvement(payment) < 2)

  function openConfirm(payment, method = 'venmo') {
    setConfirming({ payment, method })
  }

  function confirm({ method, date }) {
    const { fromId, toId, amount } = confirming.payment
    addPayment({ tripId: trip.id, fromId, toId, amount, method, date })
    setConfirming(null)
  }

  // "Your balance moves to $0.00." for the confirm sheet.
  let afterText = ''
  if (confirming) {
    const { fromId, toId, amount } = confirming.payment
    const watchId = fromId === currentUserId || toId === currentUserId ? currentUserId : fromId
    const current = balances.get(watchId).net
    const after = current + (watchId === fromId ? amount : -amount)
    afterText =
      watchId === currentUserId
        ? `Your balance moves to ${money(after)}.`
        : `${nameOf(watchId)}'s balance moves to ${money(after)}.`
  }

  const paidCards = paid.map((payment) => (
    <PaymentCard
      key={payment.id}
      from={personById(payment.fromId)}
      to={personById(payment.toId)}
      amount={money(payment.amount)}
      variant="paid"
    />
  ))

  const undo = paid.length > 0 && (
    <div className="settle__undo">
      <Button variant="link" onClick={() => undoLastPayment(trip.id)}>
        Undo last payment
      </Button>
    </div>
  )

  let content
  if (tripExpenses.length === 0) {
    content = (
      <div className="settle__done">
        <h1 className="settle__done-title">Nothing to settle yet</h1>
        <p className="settle__text">Add an expense and the payments to settle it show up here.</p>
        <Button variant="primary" to="/expenses/new">
          Add expense
        </Button>
      </div>
    )
  } else if (plan.length === 0) {
    content = (
      <>
        <div className="settle__done">
          <span className="settle__done-icon">
            <Icon name="check" size={28} strokeWidth={2.5} />
          </span>
          <h1 className="settle__done-title">All settled</h1>
          <p className="settle__text">Every balance on this trip is cleared.</p>
        </div>
        {paidCards}
        {undo}
      </>
    )
  } else {
    content = (
      <>
        <h1 className="settle__heading">
          {plan.length} {paid.length > 0 ? 'more ' : ''}
          {plan.length === 1 ? 'payment settles' : 'payments settle'} the trip
        </h1>

        {plan.map((payment) => (
          <PaymentCard
            key={`${payment.fromId}>${payment.toId}`}
            from={personById(payment.fromId)}
            to={personById(payment.toId)}
            amount={money(payment.amount)}
            variant={payment.fromId === currentUserId ? 'primary' : 'waiting'}
            onMarkPaid={() => openConfirm(payment)}
            onPayWithVenmo={() => openConfirm(payment, 'venmo')}
          >
            {payment === breakdownFor && (
              <Breakdown
                trip={trip}
                expenses={tripExpenses}
                balance={mine}
                currentUserId={currentUserId}
                nameOf={nameOf}
                plan={plan}
              />
            )}
          </PaymentCard>
        ))}

        {paidCards}
        {undo}
        <p className="settle__text settle__text--small">Pay however your group likes, then mark it paid here.</p>
      </>
    )
  }

  return (
    <Screen>
      <TopBar action="back" actionLabel="Back to home" to="/" title="Settle up" subtitle={tripSubtitle(trip)} />
      <main className={`settle ${plan.length === 0 ? 'settle--done' : ''}`.trim()}>{content}</main>

      <ConfirmPaymentSheet
        payment={
          confirming && {
            from: personById(confirming.payment.fromId),
            to: personById(confirming.payment.toId),
            amountText: money(confirming.payment.amount),
          }
        }
        startMethod={confirming?.method}
        afterText={afterText}
        onConfirm={confirm}
        onClose={() => setConfirming(null)}
      />
    </Screen>
  )
}
