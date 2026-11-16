import { Alert } from '../../components/Alert/Alert.jsx'
import { Button } from '../../components/Button/Button.jsx'
import './EmptyTrip.css'

/**
 * What Home and Expenses show while a trip has no expenses.
 *
 * Props:
 * - status: 'ready' (truly empty), 'loading' or 'error'. The last two only
 *   happen on the demo trip, while its expenses fetch their rates.
 * - onRetry: called from the Retry link in the 'error' state
 */
export function EmptyTrip({ status = 'ready', onRetry }) {
  if (status === 'loading') {
    return (
      <div className="empty-trip">
        <p className="empty-trip__text" role="status">
          Loading expenses…
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="empty-trip empty-trip--alert">
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
      </div>
    )
  }

  return (
    <div className="empty-trip">
      <h2 className="empty-trip__title">No expenses yet</h2>
      <p className="empty-trip__text">Log the first thing someone paid for. Balances fill in as you go.</p>
      <div className="empty-trip__action">
        <Button variant="primary" to="/expenses/new">
          Add first expense
        </Button>
      </div>
    </div>
  )
}
