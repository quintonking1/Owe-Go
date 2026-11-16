import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { Calendar } from '../../components/Calendar/Calendar.jsx'
import { CurrencyPicker } from '../../components/CurrencyPicker/CurrencyPicker.jsx'
import { ButtonField, FieldGroup, FieldMessage, FieldRow, TextField } from '../../components/FieldGroup/FieldGroup.jsx'
import { InlineError } from '../../components/InlineError/InlineError.jsx'
import { ProgressSteps } from '../../components/ProgressSteps/ProgressSteps.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { SearchField } from '../../components/SearchField/SearchField.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import { CURRENCIES } from '../../data/currencies.js'
import { formatLongDate, formatShortDate, nightsBetween, parseIso } from '../../lib/dates.js'
import { checkTripDetails, useNewTripDraft } from './newTripDraft.js'
import './NewTrip.css'

/** "Nov 3 to 10" in one month, "Nov 28 to Dec 2" across months, "Nov 3 to ..." half picked. */
function shortRange(start, end) {
  if (!start) return ''
  if (!end) return `${formatShortDate(start)} to ...`
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  return `${formatShortDate(start)} to ${sameMonth ? parseIso(end).day : formatShortDate(end)}`
}

/** The line under "Select dates" in the calendar sheet. */
function sheetSubtitle(start, end) {
  if (!start) return 'Pick the first day of the trip'
  if (!end) return 'Now pick the last day'
  const nights = nightsBetween(start, end)
  return `${formatShortDate(start)} to ${formatLongDate(end)} · ${nights} ${nights === 1 ? 'night' : 'nights'}`
}

/** New trip, step 1: where, what it's called, when, and the home currency. */
export function NewTripDetails() {
  const { draft, updateDraft } = useNewTripDraft()
  const navigate = useNavigate()
  const destinationErrorId = useId()

  const [calendarOpen, setCalendarOpen] = useState(false)
  // Errors stay hidden until the user has tried to go on.
  const [triedNext, setTriedNext] = useState(false)

  const problems = triedNext ? checkTripDetails(draft) : {}

  function handleNext() {
    if (Object.keys(checkTripDetails(draft)).length > 0) {
      setTriedNext(true)
      return
    }
    navigate('/trips/new/travelers')
  }

  const datesForScreenReader =
    draft.startDate && draft.endDate
      ? `${formatShortDate(draft.startDate)} to ${formatLongDate(draft.endDate)}`
      : 'not set'

  return (
    <Screen>
      <TopBar action="close" to="/trips" />

      <main className="new-trip__main">
        <h1 className="new-trip__title">Where are you headed?</h1>

        <div className="new-trip__destination">
          <SearchField
            variant="elevated"
            label="Destination"
            placeholder="Search a city or country"
            value={draft.destination}
            onChange={(destination) => updateDraft({ destination })}
            error={Boolean(problems.destination)}
            describedBy={problems.destination ? destinationErrorId : undefined}
          />
          {problems.destination && <InlineError id={destinationErrorId}>{problems.destination}</InlineError>}
        </div>

        <FieldGroup>
          <FieldRow>
            <TextField
              label="Trip name"
              placeholder="e.g. Tokyo with friends"
              value={draft.name}
              onChange={(name) => updateDraft({ name })}
              error={problems.name}
            />
            <ButtonField
              label="Dates"
              value={shortRange(draft.startDate, draft.endDate)}
              placeholder="Add dates"
              error={Boolean(problems.dates)}
              ariaLabel={`Trip dates: ${datesForScreenReader}. Change dates`}
              onClick={() => setCalendarOpen(true)}
            />
          </FieldRow>
          {problems.dates && <FieldMessage>{problems.dates}</FieldMessage>}
          <FieldRow>
            <CurrencyPicker
              variant="field"
              currencies={CURRENCIES}
              value={draft.homeCurrency}
              onChange={(homeCurrency) => updateDraft({ homeCurrency })}
            />
          </FieldRow>
        </FieldGroup>

        <p className="new-trip__help">
          Every expense converts to the home currency using the rate from the day it was paid.
        </p>
      </main>

      <footer className="new-trip__footer">
        <ProgressSteps current={1} total={3} />
        <div className="new-trip__footer-actions new-trip__footer-actions--end">
          <Button variant="dark" onClick={handleNext}>
            Next
          </Button>
        </div>
      </footer>

      <BottomSheet
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Select dates"
        subtitle={sheetSubtitle(draft.startDate, draft.endDate)}
        closeLabel="Close calendar"
      >
        <Calendar
          mode="range"
          value={{ start: draft.startDate, end: draft.endDate }}
          onChange={({ start, end }) => updateDraft({ startDate: start, endDate: end })}
        />
        <div className="new-trip__sheet-footer">
          <Button variant="link" onClick={() => updateDraft({ startDate: '', endDate: '' })}>
            Clear dates
          </Button>
          <Button variant="dark" onClick={() => setCalendarOpen(false)}>
            Done
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
