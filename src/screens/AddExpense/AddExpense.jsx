import { useId, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/Alert/Alert.jsx'
import { AmountDisplay, AmountInput } from '../../components/AmountInput/AmountInput.jsx'
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Calendar } from '../../components/Calendar/Calendar.jsx'
import { CurrencyChip, CurrencyPicker } from '../../components/CurrencyPicker/CurrencyPicker.jsx'
import { ButtonField, FieldGroup, FieldRow, TextField } from '../../components/FieldGroup/FieldGroup.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { InlineError } from '../../components/InlineError/InlineError.jsx'
import { PersonPicker } from '../../components/PersonPicker/PersonPicker.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import { CURRENCIES } from '../../data/currencies.js'
import { addExpense } from '../../data/store.js'
import { useCurrentTrip } from '../../data/useCurrentTrip.js'
import { useRate } from '../../hooks/useRate.js'
import { formatLongDate, formatShortDate, todayIso } from '../../lib/dates.js'
import { convertToHome, formatMoney, parseAmount } from '../../lib/money.js'
import { splitEqually } from '../../logic/split.js'
import './AddExpense.css'

/** Only digits and one decimal point get into the amount field. */
function cleanAmount(text) {
  const [whole, ...rest] = text.replace(/[^0-9.]/g, '').split('.')
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
}

function symbolOf(code) {
  return CURRENCIES.find((currency) => currency.code === code)?.symbol ?? ''
}

/**
 * New expense. One screen with several states:
 * - the currency menu and the date sheet can be open
 * - errors show after a Save attempt with something missing
 * - "Rates unavailable" shows when Frankfurter fails or stalls, and Save is
 *   disabled until a rate arrives. An expense is never saved without a rate.
 */
export function AddExpense() {
  const { trip, travelers, tripExpenses, currentUserId } = useCurrentTrip()
  const navigate = useNavigate()
  const amountErrorId = useId()
  const today = todayIso()

  // Start in the currency this trip used last, since that's the likely one again.
  const lastExpense = tripExpenses[tripExpenses.length - 1]

  const [amountText, setAmountText] = useState('')
  const [currency, setCurrency] = useState(lastExpense?.currency ?? trip?.homeCurrency ?? 'USD')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [paidById, setPaidById] = useState(currentUserId)
  const [splitBetweenIds, setSplitBetweenIds] = useState(trip?.travelerIds ?? [])
  const [calendarOpen, setCalendarOpen] = useState(false)
  // Errors stay hidden until the user has tried to save.
  const [triedSave, setTriedSave] = useState(false)

  const homeCurrency = trip?.homeCurrency ?? 'USD'
  const rate = useRate(currency, homeCurrency, date)

  if (!trip) return <Navigate to="/" replace />

  const ratesDown = rate.status === 'error'
  const haveRate = rate.status === 'ready'

  // Everything below is worked out from what's typed and the day's rate.
  const amount = parseAmount(amountText, currency)
  const homeAmount = haveRate && amount > 0 ? convertToHome(amount, currency, rate.rate, homeCurrency) : null
  const splitCount = splitBetweenIds.length
  // Everyone's equal share. Any leftover cent goes to the payer when saved.
  const share =
    homeAmount !== null && splitCount > 0
      ? Math.min(...splitEqually(homeAmount, splitBetweenIds, paidById).values())
      : null

  const problems = {
    amount: amount > 0 ? '' : 'Enter an amount above 0',
    title: title.trim() ? '' : 'Enter expense name',
    split: splitCount > 0 ? '' : 'Pick at least one person to split with',
  }
  const hasProblems = Boolean(problems.amount || problems.title || problems.split)
  const shown = triedSave ? problems : { amount: '', title: '', split: '' }

  function handleSave() {
    if (hasProblems) {
      setTriedSave(true)
      return
    }
    if (!haveRate) return // The button is disabled, but never save without a rate.

    addExpense({
      tripId: trip.id,
      title: title.trim(),
      date,
      amount,
      currency,
      rate: rate.rate,
      rateDate: rate.rateDate,
      paidById,
      splitBetweenIds,
    })
    navigate('/expenses')
  }

  // The converted amount on the right-hand side.
  let homeText = formatMoney(homeAmount ?? 0, homeCurrency)
  if (ratesDown) homeText = `${symbolOf(homeCurrency)} ——`

  // The small line under the two amounts.
  let rateText = 'Getting rate…'
  if (currency === homeCurrency) rateText = 'Home currency, no conversion'
  else if (haveRate) {
    rateText = `1 ${currency} = ${rate.rate} ${homeCurrency} · ${formatShortDate(rate.rateDate)} rate`
  }

  // The footer amount.
  let eachText = '—'
  if (share !== null) eachText = formatMoney(share, homeCurrency)
  else if (!haveRate && currency !== homeCurrency) eachText = 'Waiting on rate'

  return (
    <Screen>
      <TopBar action="close" title="New expense" onAction={() => navigate(-1)} />

      <main className="add-expense__main">
        <div className="add-expense__amounts">
          <div className="add-expense__amount-row">
            <div className="add-expense__amount">
              <CurrencyPicker
                currencies={CURRENCIES}
                value={currency}
                onChange={setCurrency}
                label={`Paid in ${currency}. Change currency`}
              />
              <AmountInput
                value={amountText}
                onChange={(text) => setAmountText(cleanAmount(text))}
                symbol={symbolOf(currency)}
                label={`Amount in ${currency}`}
                error={Boolean(shown.amount)}
                describedBy={shown.amount ? amountErrorId : undefined}
              />
            </div>

            <span className="add-expense__arrow">
              <Icon name="arrow-right" size={20} strokeWidth={2} />
            </span>

            <div className="add-expense__amount">
              <CurrencyChip code={homeCurrency} />
              <AmountDisplay muted={homeAmount === null}>{homeText}</AmountDisplay>
            </div>
          </div>

          {!ratesDown && (
            <span className="add-expense__rate mono" aria-live="polite">
              {rateText}
            </span>
          )}

          {shown.amount && <InlineError id={amountErrorId}>{shown.amount}</InlineError>}

          {ratesDown && (
            <Alert
              title="Rates unavailable"
              action={
                <Button variant="link" size="md" onClick={rate.retry}>
                  Retry
                </Button>
              }
            >
              Could not reach the exchange rate service.
            </Alert>
          )}
        </div>

        <FieldGroup>
          <FieldRow>
            <TextField
              wide
              label="What for"
              placeholder="Dinner, tickets, taxi"
              value={title}
              onChange={setTitle}
              error={shown.title || undefined}
            />
            <ButtonField
              label="Date"
              value={formatShortDate(date)}
              ariaLabel={`Date paid: ${formatShortDate(date)}. Change date`}
              onClick={() => setCalendarOpen(true)}
            />
          </FieldRow>
        </FieldGroup>

        <PersonPicker legend="Paid by" people={travelers} mode="single" value={paidById} onChange={setPaidById} />

        <PersonPicker
          legend="Split equally between"
          people={travelers}
          mode="multiple"
          value={splitBetweenIds}
          onChange={setSplitBetweenIds}
          error={shown.split || undefined}
        />
      </main>

      <footer className="add-expense__footer">
        <div className="add-expense__each">
          <span className="add-expense__each-label">
            {splitCount > 0 ? `Each pays (${splitCount})` : 'Each pays'}
          </span>
          <span className="add-expense__each-amount mono" aria-live="polite">
            {eachText}
          </span>
        </div>
        <Button variant="primary" disabled={!haveRate} onClick={handleSave}>
          Save
        </Button>
      </footer>

      <BottomSheet
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="When was it paid?"
        subtitle={`${formatLongDate(date)} · rate from this day`}
        closeLabel="Close calendar"
      >
        {/* Expenses can't be dated in the future, so days after today are disabled. */}
        <Calendar mode="single" value={date} onChange={setDate} maxDate={today} />
        <div className="add-expense__sheet-footer">
          <Button variant="link" onClick={() => setDate(today)}>
            Today
          </Button>
          <Button variant="dark" onClick={() => setCalendarOpen(false)}>
            Done
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
