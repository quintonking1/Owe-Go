import { useId, useState } from 'react'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Calendar } from '../../components/Calendar/Calendar.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { IconButton } from '../../components/IconButton/IconButton.jsx'
import { PAYMENT_METHODS } from '../../data/paymentMethods.js'
import { formatLongDate, todayIso } from '../../lib/dates.js'
import './ConfirmPaymentSheet.css'

/**
 * "Confirm payment": how it was paid and when, then Mark paid.
 * Choosing the method or the date swaps the sheet's content, then returns.
 *
 * Props:
 * - payment: { from, to, amountText } where from and to are people, or null when closed
 * - startMethod: the method to start on, e.g. 'venmo'
 * - afterText: what happens to the balance, e.g. "Your balance moves to $0.00."
 * - onConfirm({ method, date }), onClose
 */
export function ConfirmPaymentSheet({ payment, startMethod = 'venmo', afterText, onConfirm, onClose }) {
  // The sheet is named by its question, e.g. "Mark $54.05 to Arno as paid?"
  const questionId = useId()

  return (
    <BottomSheet
      open={Boolean(payment)}
      onClose={onClose}
      backdrop="light"
      showHandle={false}
      labelledBy={questionId}
      ariaLabel="Confirm payment"
    >
      {/* A fresh form each time the sheet opens, so old choices don't carry over. */}
      {payment && (
        <ConfirmForm
          key={`${payment.from.id}>${payment.to.id}`}
          payment={payment}
          startMethod={startMethod}
          afterText={afterText}
          onConfirm={onConfirm}
          onClose={onClose}
          questionId={questionId}
        />
      )}
    </BottomSheet>
  )
}

function ConfirmForm({ payment, startMethod, afterText, onConfirm, onClose, questionId }) {
  const today = todayIso()
  const [view, setView] = useState('confirm') // 'confirm', 'method' or 'date'
  const [methodId, setMethodId] = useState(startMethod)
  const [date, setDate] = useState(today)
  const method = PAYMENT_METHODS.find((option) => option.id === methodId)
  const toName = payment.to.name === 'You' ? 'you' : payment.to.name
  const fromYou = payment.from.name === 'You'
  const question = fromYou
    ? `Mark ${payment.amountText} to ${toName} as paid?`
    : `Mark ${payment.amountText} from ${payment.from.name} to ${toName} as paid?`

  if (view === 'method') {
    return (
      <div className="confirm-pay">
        <SubHeader title="Paid with" onBack={() => setView('confirm')} />
        <div className="confirm-pay__options" role="radiogroup" aria-label="Paid with">
          {PAYMENT_METHODS.map((option) => (
            <button
              type="button"
              key={option.id}
              className="confirm-pay__option"
              role="radio"
              aria-checked={option.id === methodId}
              onClick={() => {
                setMethodId(option.id)
                setView('confirm')
              }}
            >
              <span className="confirm-pay__tag mono">{option.tag}</span>
              <span className="confirm-pay__option-name">{option.name}</span>
              {option.id === methodId && (
                <span className="confirm-pay__check">
                  <Icon name="check" size={16} strokeWidth={2.5} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'date') {
    return (
      <div className="confirm-pay">
        <SubHeader title="When was it paid?" onBack={() => setView('confirm')} />
        <Calendar mode="single" value={date} onChange={setDate} maxDate={today} />
        <Button variant="dark" fullWidth onClick={() => setView('confirm')}>
          Done
        </Button>
      </div>
    )
  }

  return (
    <div className="confirm-pay">
      <div className="confirm-pay__bar">
        <IconButton icon="close" label="Close" onClick={onClose} />
        <span className="confirm-pay__bar-title">Confirm payment</span>
        <span className="confirm-pay__spacer" />
      </div>

      <div className="confirm-pay__people" aria-hidden="true">
        <Avatar name={payment.from.initial} color={payment.from.color} size="xl" />
        <span className="confirm-pay__arrow">
          <Icon name="arrow-right" size={22} strokeWidth={1.75} />
        </span>
        <Avatar name={payment.to.initial} color={payment.to.color} size="xl" />
      </div>

      <h2 className="confirm-pay__question" id={questionId}>
        {question}
      </h2>
      <p className="confirm-pay__text">{afterText} You can undo this from Settle up.</p>

      <div className="confirm-pay__fields">
        <button type="button" className="confirm-pay__field" onClick={() => setView('method')}>
          <span className="confirm-pay__tag mono">{method.tag}</span>
          <span className="confirm-pay__field-text">
            <span className="confirm-pay__field-label">Paid with</span>
            <span className="confirm-pay__field-value">{method.name}</span>
          </span>
          <Icon name="chevron-right" size={18} strokeWidth={1.75} />
        </button>
        <button type="button" className="confirm-pay__field" onClick={() => setView('date')}>
          <span className="confirm-pay__field-text">
            <span className="confirm-pay__field-label">Date</span>
            <span className="confirm-pay__field-value">{formatLongDate(date)}</span>
          </span>
          <Icon name="chevron-right" size={18} strokeWidth={1.75} />
        </button>
      </div>

      <Button variant="primary" fullWidth onClick={() => onConfirm({ method: methodId, date })}>
        Mark paid
      </Button>
    </div>
  )
}

/** Back button and title for the method and date views. */
function SubHeader({ title, onBack }) {
  return (
    <div className="confirm-pay__bar">
      <IconButton icon="back" label="Back to confirm payment" onClick={onBack} />
      <h2 className="confirm-pay__bar-title">{title}</h2>
      <span className="confirm-pay__spacer" />
    </div>
  )
}
