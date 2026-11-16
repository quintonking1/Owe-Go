import { useState } from 'react'
import { Alert } from '../components/Alert/Alert.jsx'
import { AmountDisplay, AmountInput } from '../components/AmountInput/AmountInput.jsx'
import { Avatar, AvatarStack } from '../components/Avatar/Avatar.jsx'
import { BottomSheet } from '../components/BottomSheet/BottomSheet.jsx'
import { Button } from '../components/Button/Button.jsx'
import { Calendar } from '../components/Calendar/Calendar.jsx'
import { Collapsible } from '../components/Collapsible/Collapsible.jsx'
import { CurrencyChip, CurrencyPicker } from '../components/CurrencyPicker/CurrencyPicker.jsx'
import { ExpenseRow } from '../components/ExpenseRow/ExpenseRow.jsx'
import { ButtonField, FieldGroup, FieldMessage, FieldRow, TextField } from '../components/FieldGroup/FieldGroup.jsx'
import { FloatingButton } from '../components/FloatingButton/FloatingButton.jsx'
import { IconButton } from '../components/IconButton/IconButton.jsx'
import { InlineError } from '../components/InlineError/InlineError.jsx'
import { PersonPicker } from '../components/PersonPicker/PersonPicker.jsx'
import { ProgressSteps } from '../components/ProgressSteps/ProgressSteps.jsx'
import { TabBar } from '../components/TabBar/TabBar.jsx'
import { TopBar } from '../components/TopBar/TopBar.jsx'
import { formatLongDate, formatShortDate, todayIso } from '../lib/dates.js'
import './ComponentsPage.css'

/*
 * Preview page: every shared component in each of its states, in a 390px
 * column. The sample values below exist only so there is something to look
 * at. Real screens pass in real data.
 */

const PEOPLE = [
  { id: 'you', name: 'You', initial: 'Q', color: 'you' },
  { id: 'arno', name: 'Arno', color: 'arno' },
  { id: 'catherine', name: 'Catherine', color: 'catherine' },
  { id: 'dinah', name: 'Dinah', color: 'dinah' },
]

const CURRENCIES = [
  { code: 'USD', name: 'US dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'THB', name: 'Thai baht' },
  { code: 'MXN', name: 'Mexican peso' },
]

const PREVIEW_TABS = [
  { to: '/components', label: 'Home', icon: 'home' },
  { to: '/expenses', label: 'Expenses', icon: 'list' },
  { to: '/trips', label: 'Trips', icon: 'trips' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
]

function Section({ title, note, flush = false, children }) {
  return (
    <section className="preview__section">
      <h2 className="preview__heading">{title}</h2>
      {note && <p className="preview__note">{note}</p>}
      <div className={`preview__body ${flush ? 'preview__body--flush' : ''}`.trim()}>{children}</div>
    </section>
  )
}

function Row({ children }) {
  return <div className="preview__row">{children}</div>
}

export function ComponentsPage() {
  const today = todayIso()

  const [currency, setCurrency] = useState('JPY')
  const [homeCurrency, setHomeCurrency] = useState('USD')
  const [payer, setPayer] = useState('arno')
  const [split, setSplit] = useState(['you', 'arno', 'catherine', 'dinah'])
  const [emptySplit, setEmptySplit] = useState([])
  const [amount, setAmount] = useState('38000')
  const [badAmount, setBadAmount] = useState('')
  const [title, setTitle] = useState('Ramen in Shinjuku')
  const [emptyTitle, setEmptyTitle] = useState('')
  const [tripName, setTripName] = useState('')
  const [date, setDate] = useState(today)
  const [range, setRange] = useState({ start: '', end: '' })
  const [sheet, setSheet] = useState(null)

  const closeSheet = () => setSheet(null)
  const rangeText = range.start
    ? `${formatShortDate(range.start)} to ${range.end ? formatShortDate(range.end) : '...'}`
    : ''

  return (
    <main className="preview">
      <header className="preview__intro">
        <h1 className="preview__title">Components</h1>
        <p className="preview__note">
          Every shared component in each state, at 390px wide. Sample values are placeholders.
        </p>
      </header>

      <Section title="Button" note="Variants: primary, dark, outline, link. Sizes: lg (48px), md (44px).">
        <Row>
          <Button variant="primary">Save</Button>
          <Button variant="dark">Next</Button>
          <Button variant="outline">Outline</Button>
        </Row>
        <Row>
          <Button variant="primary" size="md">Save</Button>
          <Button variant="dark" size="md">Settle up</Button>
          <Button variant="outline" size="md">See balances</Button>
        </Row>
        <Row>
          <Button variant="link">Back</Button>
          <Button variant="link" size="md">Retry</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </Row>
        <Row>
          <Button variant="dark" size="md" fullWidth>Full width</Button>
          <Button variant="outline" size="md" fullWidth>Full width</Button>
        </Row>
      </Section>

      <Section title="IconButton" note="36px circle with a 44px tap area. Always has an aria-label.">
        <Row>
          <IconButton icon="back" label="Back" />
          <IconButton icon="close" label="Close" />
          <IconButton icon="back" label="Back (disabled)" disabled />
        </Row>
      </Section>

      <Section title="Avatar" note="Sizes sm 36, md 40, lg 44, xl 52. Four person colors.">
        <Row>
          <Avatar name="Q" color="you" size="sm" />
          <Avatar name="Arno" color="arno" size="md" />
          <Avatar name="Catherine" color="catherine" size="lg" />
          <Avatar name="Dinah" color="dinah" size="xl" />
        </Row>
        <Row>
          <AvatarStack people={PEOPLE} size="sm" />
          <AvatarStack people={PEOPLE.slice(0, 2)} size="md" />
        </Row>
      </Section>

      <Section title="TopBar" note="Close bar is centered. Back bar is left-aligned, with an optional subtitle." flush>
        <div className="preview__frame">
          <TopBar action="close" title="New expense" onAction={() => {}} />
        </div>
        <div className="preview__frame">
          <TopBar action="back" actionLabel="Back to home" title="Balances" subtitle="Trip · dates · currency" onAction={() => {}} />
        </div>
        <div className="preview__frame">
          <TopBar action="back" onAction={() => {}} />
        </div>
      </Section>

      <Section title="ExpenseRow" note="Regular (Expenses tab), then compact (Home).">
        <ul>
          <ExpenseRow currency="JPY" title="Expense title" meta="Arno paid · split 4" homeAmount="$00.00" originalAmount="¥0,000" />
          <ExpenseRow currency="EUR" title="A much longer expense title that has to truncate" meta="Catherine paid · split 3" homeAmount="$00.00" originalAmount="€00.00" />
        </ul>
        <ul>
          <ExpenseRow size="compact" currency="JPY" title="Expense title" meta="Nov 5 · Arno paid · split 4" homeAmount="$00.00" originalAmount="¥0,000" />
          <ExpenseRow size="compact" currency="EUR" title="Expense title" meta="Nov 3 · Catherine paid · split 3" homeAmount="$00.00" originalAmount="€00.00" />
        </ul>
      </Section>

      <Section title="CurrencyPicker" note="Pill opens a listbox. Try the arrow keys, Enter and Escape. The plain chip can't be changed.">
        <Row>
          <CurrencyPicker currencies={CURRENCIES} value={currency} onChange={setCurrency} label={`Paid in ${currency}. Change currency`} />
          <CurrencyChip code="USD" />
        </Row>
      </Section>

      <Section title="PersonPicker" note="Single-select for Paid by. Multi-select with Select all / Clear for the split. Last one shows the error state.">
        <PersonPicker legend="Paid by" people={PEOPLE} mode="single" value={payer} onChange={setPayer} />
        <PersonPicker legend="Split equally between" people={PEOPLE} mode="multiple" value={split} onChange={setSplit} />
        <PersonPicker
          legend="Split equally between"
          people={PEOPLE}
          mode="multiple"
          value={emptySplit}
          onChange={setEmptySplit}
          error={emptySplit.length === 0 ? 'Pick at least one person to split with' : undefined}
        />
      </Section>

      <Section title="AmountInput" note="Editable amount, the read-only display beside it, and the error state.">
        <div className="preview__amounts">
          <div className="preview__amount">
            <CurrencyChip code="JPY" />
            <AmountInput value={amount} onChange={setAmount} symbol="¥" label="Amount in JPY" />
          </div>
          <div className="preview__amount">
            <CurrencyChip code="USD" />
            <AmountDisplay>$000.00</AmountDisplay>
          </div>
        </div>
        <div className="preview__amounts">
          <div className="preview__amount">
            <CurrencyChip code="JPY" />
            <AmountInput value={badAmount} onChange={setBadAmount} symbol="¥" label="Amount in JPY" error describedBy="preview-amount-error" />
          </div>
          <div className="preview__amount">
            <CurrencyChip code="USD" />
            <AmountDisplay muted>$ ——</AmountDisplay>
          </div>
        </div>
        <InlineError id="preview-amount-error">Enter an amount above 0</InlineError>
      </Section>

      <Section title="FieldGroup" note="Fields side by side, the same with an error, and rows stacked with a currency row.">
        <FieldGroup>
          <FieldRow>
            <TextField wide label="What for" placeholder="Dinner, tickets, taxi" value={title} onChange={setTitle} />
            <ButtonField label="Date" value={formatShortDate(date)} ariaLabel={`Date paid: ${formatShortDate(date)}. Change date`} onClick={() => setSheet('single')} />
          </FieldRow>
        </FieldGroup>
        <FieldGroup>
          <FieldRow>
            <TextField wide label="What for" placeholder="Dinner, tickets, taxi" value={emptyTitle} onChange={setEmptyTitle} error={emptyTitle.trim() ? undefined : 'Enter expense name'} />
            <ButtonField label="Date" value={formatShortDate(date)} ariaLabel={`Date paid: ${formatShortDate(date)}. Change date`} onClick={() => setSheet('single')} />
          </FieldRow>
        </FieldGroup>
        <FieldGroup>
          <FieldRow>
            <TextField label="Trip name" placeholder="e.g. Tokyo with friends" value={tripName} onChange={setTripName} />
            <ButtonField label="Dates" value={rangeText} placeholder="Add dates" error={!range.end} ariaLabel="Trip dates. Change dates" onClick={() => setSheet('range')} />
          </FieldRow>
          {!range.end && <FieldMessage>Pick a start and end date</FieldMessage>}
          <FieldRow>
            <CurrencyPicker variant="field" currencies={CURRENCIES} value={homeCurrency} onChange={setHomeCurrency} />
          </FieldRow>
        </FieldGroup>
      </Section>

      <Section title="InlineError">
        <InlineError>Add where you're going</InlineError>
      </Section>

      <Section title="Alert" note="With and without an action.">
        <Alert title="Rates unavailable" action={<Button variant="link" size="md">Retry</Button>}>
          Could not reach the exchange rate service.
        </Alert>
        <Alert title="Alert title">Body text explaining what happened.</Alert>
      </Section>

      <Section title="BottomSheet" note="Opens over a dimmed page. Traps focus, closes on Escape or a tap outside, and returns focus to the button.">
        <Row>
          <Button variant="outline" size="md" onClick={() => setSheet('single')}>Date sheet</Button>
          <Button variant="outline" size="md" onClick={() => setSheet('range')}>Range sheet</Button>
          <Button variant="outline" size="md" onClick={() => setSheet('plain')}>No handle</Button>
        </Row>
      </Section>

      <Section title="Calendar" note="Single date with future days disabled, then a date range. Arrow keys move between days.">
        <Calendar mode="single" value={date} onChange={setDate} maxDate={today} />
        <hr className="preview__rule" />
        <Calendar mode="range" value={range} onChange={setRange} />
      </Section>

      <Section title="ProgressSteps" note="Step 1, 2 and 3 of 3.">
        <ProgressSteps current={1} />
        <ProgressSteps current={2} />
        <ProgressSteps current={3} />
      </Section>

      <Section title="Collapsible" note="Starts collapsed. The chevron turns when open.">
        <Collapsible title="How we got $000.00">
          <p className="preview__note">The breakdown goes here.</p>
        </Collapsible>
      </Section>

      <Section title="TabBar and FloatingButton" note="Active tab in blue with aria-current. The pill floats 18px above the bar." flush>
        <div className="preview__frame preview__frame--tall">
          <FloatingButton onClick={() => {}}>Add expense</FloatingButton>
          <TabBar tabs={PREVIEW_TABS} />
        </div>
      </Section>

      <BottomSheet
        open={sheet === 'single'}
        onClose={closeSheet}
        title="When was it paid?"
        subtitle={`${formatLongDate(date)} · rate from this day`}
        closeLabel="Close calendar"
      >
        <Calendar mode="single" value={date} onChange={setDate} maxDate={today} />
        <div className="preview__sheet-footer">
          <Button variant="link" onClick={() => setDate(today)}>Today</Button>
          <Button variant="dark" onClick={closeSheet}>Done</Button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'range'}
        onClose={closeSheet}
        title="Select dates"
        subtitle={range.start ? (range.end ? `${formatShortDate(range.start)} to ${formatLongDate(range.end)}` : 'Now pick the last day') : 'Pick the first day of the trip'}
        closeLabel="Close calendar"
      >
        <Calendar mode="range" value={range} onChange={setRange} />
        <div className="preview__sheet-footer">
          <Button variant="link" onClick={() => setRange({ start: '', end: '' })}>Clear dates</Button>
          <Button variant="dark" onClick={closeSheet}>Done</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'plain'} onClose={closeSheet} ariaLabel="Example sheet" showHandle={false}>
        <div className="preview__sheet-bar">
          <IconButton icon="close" label="Close" onClick={closeSheet} />
          <span className="preview__sheet-bar-title">Sheet title</span>
          <span className="preview__sheet-bar-spacer" />
        </div>
        <p className="preview__note">A sheet with its own header and no grab handle.</p>
        <Button variant="primary" fullWidth onClick={closeSheet}>Confirm</Button>
      </BottomSheet>
    </main>
  )
}
