/**
 * Date helpers for the calendar. A date is a plain "YYYY-MM-DD" string, so
 * dates can be compared with < and > and never shift with time zones.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(number) {
  return String(number).padStart(2, '0')
}

/** (2026, 10, 5) -> "2026-11-05". Months count from 0, like JavaScript dates. */
export function toIso(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

/** "2026-11-05" -> { year: 2026, month: 10, day: 5 } */
export function parseIso(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

function fromUtcDate(date) {
  return toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/** Today's date in the user's own time zone. */
export function todayIso() {
  const now = new Date()
  return toIso(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Move a date forward or back by a number of days. */
export function addDays(iso, amount) {
  const { year, month, day } = parseIso(iso)
  return fromUtcDate(new Date(Date.UTC(year, month, day + amount)))
}

/** Move a date by whole months, staying inside the new month (Jan 31 -> Feb 28). */
export function addMonths(iso, amount) {
  const { year, month, day } = parseIso(iso)
  const lastDay = new Date(Date.UTC(year, month + amount + 1, 0)).getUTCDate()
  return fromUtcDate(new Date(Date.UTC(year, month + amount, Math.min(day, lastDay))))
}

/** 0 for Sunday through 6 for Saturday. */
export function weekdayOf(iso) {
  const { year, month, day } = parseIso(iso)
  return new Date(Date.UTC(year, month, day)).getUTCDay()
}

/**
 * The weeks of a month, for drawing a calendar. Each week is 7 slots holding
 * a date string, or null for the blank slots before the 1st and after the end.
 */
export function monthWeeks(year, month) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const slots = Array(firstWeekday).fill(null)
  for (let day = 1; day <= dayCount; day += 1) slots.push(toIso(year, month, day))
  while (slots.length % 7 !== 0) slots.push(null)

  const weeks = []
  for (let index = 0; index < slots.length; index += 7) weeks.push(slots.slice(index, index + 7))
  return weeks
}

/** (2026, 10) -> "November 2026" */
export function formatMonthYear(year, month) {
  return `${MONTHS[month]} ${year}`
}

/** "2026-11-05" -> "Nov 5" */
export function formatShortDate(iso) {
  const { month, day } = parseIso(iso)
  return `${MONTHS[month].slice(0, 3)} ${day}`
}

/** "2026-11-05" -> "Nov 5, 2026" */
export function formatLongDate(iso) {
  return `${formatShortDate(iso)}, ${parseIso(iso).year}`
}

/** ("2026-11-03", "2026-11-10") -> "Nov 3 to 10, 2026" */
export function formatDateRange(startIso, endIso) {
  const start = parseIso(startIso)
  const end = parseIso(endIso)
  if (start.year !== end.year) return `${formatLongDate(startIso)} to ${formatLongDate(endIso)}`
  const endText = start.month === end.month ? String(end.day) : formatShortDate(endIso)
  return `${formatShortDate(startIso)} to ${endText}, ${end.year}`
}
