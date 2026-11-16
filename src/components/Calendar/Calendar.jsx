import { useEffect, useId, useRef, useState } from 'react'
import {
  WEEKDAYS,
  addDays,
  addMonths,
  formatLongDate,
  formatMonthYear,
  monthWeeks,
  parseIso,
  toIso,
  todayIso,
  weekdayOf,
} from '../../lib/dates.js'
import { IconButton } from '../IconButton/IconButton.jsx'
import './Calendar.css'

/**
 * A month of days to pick from. Dates are "YYYY-MM-DD" strings.
 *
 * Props:
 * - mode: 'single' (one day) or 'range' (a start and an end day)
 * - value: for 'single', a date or ''. For 'range', { start, end } with '' for unset.
 * - onChange: called with the new date, or the new { start, end }
 * - maxDate: days after this can't be picked. Pass today to block future dates.
 * - minDate: days before this can't be picked
 *
 * Keyboard: arrow keys move by a day or a week, Home and End go to the ends
 * of the week, Page Up and Page Down change month, Enter or Space picks.
 */
export function Calendar({ mode = 'single', value, onChange, maxDate, minDate }) {
  const start = mode === 'range' ? value.start : value
  const end = mode === 'range' ? value.end : ''

  // The day the keyboard is "on". Only this day is in the Tab order.
  const [focusDate, setFocusDate] = useState(() => clamp(start || todayIso(), minDate, maxDate))
  const [view, setView] = useState(() => {
    const { year, month } = parseIso(focusDate)
    return { year, month }
  })

  // If the parent changes the date itself (say, a "Today" button), jump to it.
  const [lastStart, setLastStart] = useState(start)
  if (start !== lastStart) {
    setLastStart(start)
    if (start) {
      const { year, month } = parseIso(start)
      setFocusDate(start)
      setView({ year, month })
    }
  }

  const gridRef = useRef(null)
  const moveFocusAfterRender = useRef(false)
  const labelId = useId()

  const weeks = monthWeeks(view.year, view.month)
  const firstOfMonth = toIso(view.year, view.month, 1)
  const days = weeks.flat().filter(Boolean)
  const lastOfMonth = days[days.length - 1]

  const isDisabled = (day) => Boolean((maxDate && day > maxDate) || (minDate && day < minDate))

  // The one day that Tab lands on: the focus day if it's showing, else the first day you can pick.
  const tabStop = days.includes(focusDate) && !isDisabled(focusDate) ? focusDate : days.find((day) => !isDisabled(day))

  // After an arrow key moves the focus day, move real keyboard focus to it.
  useEffect(() => {
    if (!moveFocusAfterRender.current) return
    moveFocusAfterRender.current = false
    gridRef.current?.querySelector(`[data-date="${focusDate}"]`)?.focus()
  }, [focusDate, view])

  function showMonthOf(day) {
    const { year, month } = parseIso(day)
    setView({ year, month })
  }

  function changeMonth(amount) {
    const next = clamp(addMonths(focusDate, amount), minDate, maxDate)
    setFocusDate(next)
    showMonthOf(addMonths(firstOfMonth, amount))
  }

  function pick(day) {
    setFocusDate(day)
    if (mode === 'single') {
      onChange(day)
    } else if (!start || end || day < start) {
      // No range yet, a finished range, or a day before the start: begin again here.
      onChange({ start: day, end: '' })
    } else if (day > start) {
      onChange({ start, end: day })
    }
  }

  function handleKeyDown(event) {
    const current = event.target.dataset.date
    if (!current) return

    const moves = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      Home: () => addDays(current, -weekdayOf(current)),
      End: () => addDays(current, 6 - weekdayOf(current)),
      PageUp: () => addMonths(current, -1),
      PageDown: () => addMonths(current, 1),
    }
    if (!moves[event.key]) return

    event.preventDefault()
    // Never land on a day that can't be picked: stop at the last one allowed.
    const target = clamp(moves[event.key](), minDate, maxDate)
    if (target === current) return

    moveFocusAfterRender.current = true
    setFocusDate(target)
    showMonthOf(target)
  }

  const hasRange = mode === 'range' && start && end && start !== end

  return (
    <div className="calendar">
      <div className="calendar__header">
        <IconButton
          icon="back"
          label="Previous month"
          disabled={Boolean(minDate && firstOfMonth <= minDate)}
          onClick={() => changeMonth(-1)}
        />
        <span className="calendar__month" id={labelId} aria-live="polite">
          {formatMonthYear(view.year, view.month)}
        </span>
        <IconButton
          className="calendar__next"
          icon="back"
          label="Next month"
          disabled={Boolean(maxDate && lastOfMonth >= maxDate)}
          onClick={() => changeMonth(1)}
        />
      </div>

      {/* The day buttons inside are what take focus; this handler moves between them. */}
      {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div className="calendar__grid" role="grid" aria-labelledby={labelId} ref={gridRef} onKeyDown={handleKeyDown}>
        <div className="calendar__week" role="row">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="calendar__weekday" role="columnheader" aria-label={weekday}>
              {weekday.charAt(0)}
            </span>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar__week" role="row">
            {week.map((day, dayIndex) => {
              // Blank slot before the 1st or after the last day of the month.
              if (!day) return <span key={dayIndex} className="calendar__cell" aria-hidden="true" />

              const isStart = day === start
              const isEnd = day === end
              const selected = isStart || isEnd
              const disabled = isDisabled(day)

              const cellClasses = ['calendar__cell']
              if (hasRange && day > start && day < end) cellClasses.push('calendar__cell--in-range')
              if (hasRange && isStart) cellClasses.push('calendar__cell--range-start')
              if (hasRange && isEnd) cellClasses.push('calendar__cell--range-end')

              let label = formatLongDate(day)
              if (mode === 'range' && isStart) label += ', start'
              else if (mode === 'range' && isEnd) label += ', end'
              else if (selected) label += ', selected'
              if (disabled) label += ', unavailable'

              return (
                <span key={day} className={cellClasses.join(' ')} role="gridcell">
                  <button
                    type="button"
                    className={`calendar__day ${selected ? 'calendar__day--selected' : ''}`.trim()}
                    data-date={day}
                    aria-label={label}
                    aria-pressed={selected}
                    disabled={disabled}
                    tabIndex={day === tabStop ? 0 : -1}
                    onClick={() => pick(day)}
                  >
                    {parseIso(day).day}
                  </button>
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Keep a date inside the allowed range. */
function clamp(day, minDate, maxDate) {
  if (maxDate && day > maxDate) return maxDate
  if (minDate && day < minDate) return minDate
  return day
}
