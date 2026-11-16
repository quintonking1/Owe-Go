import { formatShortRange } from '../../lib/dates.js'

/** The small line under a screen title: "Tokyo · Nov 3 to 10 · USD". */
export function tripSubtitle(trip) {
  const city = trip.destination.split(',')[0]
  return `${city} · ${formatShortRange(trip.startDate, trip.endDate)} · ${trip.homeCurrency}`
}
