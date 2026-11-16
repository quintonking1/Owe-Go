import { AvatarStack } from '../../components/Avatar/Avatar.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import './PaymentCard.css'

/**
 * One payment on Settle up.
 *
 * Props:
 * - from, to: the two people, as { id, name, initial, color }. "You" is
 *   already the current user's name.
 * - amount: the formatted amount
 * - variant:
 *     'primary'  you pay: raised card with Pay with Venmo and Mark paid
 *     'waiting'  someone else pays: "Waiting on ..." and a Mark paid link
 *     'paid'     already marked paid: amount struck through, Paid badge
 * - onMarkPaid, onPayWithVenmo: open the confirm sheet
 * - children: optional content under the header (the "How we got" breakdown)
 */
export function PaymentCard({ from, to, amount, variant, onMarkPaid, onPayWithVenmo, children }) {
  const fromYou = from.name === 'You'
  const toName = to.name === 'You' ? 'you' : to.name
  const title = `${from.name} ${fromYou ? 'pay' : 'pays'} ${toName}`

  return (
    <section className={`payment-card payment-card--${variant}`} aria-label={`${title}, ${amount}`}>
      <div className="payment-card__header">
        <AvatarStack people={[from, to]} size="md" />
        <div className="payment-card__text">
          <span className="payment-card__title">{title}</span>
          <span className="payment-card__amount mono">
            {variant === 'paid' && <span className="visually-hidden">Paid: </span>}
            {amount}
          </span>
        </div>
        {variant === 'paid' && (
          <span className="payment-card__badge">
            <Icon name="check" size={12} strokeWidth={2.5} />
            Paid
          </span>
        )}
      </div>

      {children}

      {variant === 'primary' && (
        <div className="payment-card__actions">
          <Button variant="outline" size="md" fullWidth onClick={onPayWithVenmo}>
            Pay with Venmo
          </Button>
          <Button variant="dark" size="md" fullWidth onClick={onMarkPaid}>
            Mark paid
          </Button>
        </div>
      )}

      {variant === 'waiting' && (
        <div className="payment-card__waiting">
          <p className="payment-card__waiting-text">Waiting on {fromYou ? 'you' : from.name}</p>
          <Button variant="link" onClick={onMarkPaid}>
            Mark paid
          </Button>
        </div>
      )}
    </section>
  )
}
