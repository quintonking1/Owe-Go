import { Link } from 'react-router-dom'
import './ExpenseRow.css'

/**
 * One expense in a list. Put it inside a <ul>.
 *
 * Props:
 * - currency: the code it was paid in, e.g. "JPY" (shown in the chip)
 * - title: what it was for
 * - meta: the small line, e.g. "Nov 5 · Arno paid · split 4"
 * - homeAmount: amount in the home currency, already formatted
 * - originalAmount: amount in the paid currency, already formatted
 * - size: 'compact' (Home list) or 'regular' (Expenses tab)
 * - to: optional route, which makes the whole row a link
 *
 * This component only displays. It never works out amounts itself.
 */
export function ExpenseRow({
  currency,
  title,
  meta,
  homeAmount,
  originalAmount,
  size = 'regular',
  to,
}) {
  const content = (
    <>
      <span className="expense-row__chip mono" aria-hidden="true">
        {currency}
      </span>
      <span className="expense-row__text">
        <span className="expense-row__title">{title}</span>
        <span className="expense-row__meta">{meta}</span>
      </span>
      <span className="expense-row__amounts">
        <span className="expense-row__home mono">{homeAmount}</span>
        <span className="expense-row__original mono">
          <span className="visually-hidden">Paid as </span>
          {originalAmount}
        </span>
      </span>
    </>
  )

  return (
    <li className={`expense-row expense-row--${size}`}>
      {to ? (
        <Link className="expense-row__inner" to={to}>
          {content}
        </Link>
      ) : (
        <div className="expense-row__inner">{content}</div>
      )}
    </li>
  )
}
