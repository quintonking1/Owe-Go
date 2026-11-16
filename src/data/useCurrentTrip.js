import { useAppData } from './store.js'

/**
 * Everything a screen needs about the trip the user is on.
 *
 * Returns:
 * - trip: the current trip, or undefined if there isn't one
 * - travelers: the people on it, as { id, name, initial, color }. The current
 *   user is named "You" but keeps their own initial for the avatar.
 * - tripExpenses: this trip's expenses
 * - tripPayments: settle-up payments marked paid on this trip
 * - currentUserId
 * - nameOf(id): "You" for the current user, otherwise the person's name
 */
export function useCurrentTrip() {
  const { currentUserId, currentTripId, people, trips, expenses, payments } = useAppData()

  const trip = trips.find((candidate) => candidate.id === currentTripId)

  const nameOf = (id) => {
    if (id === currentUserId) return 'You'
    return people.find((person) => person.id === id)?.name ?? 'Someone'
  }

  const travelers = (trip?.travelerIds ?? [])
    .map((id) => people.find((person) => person.id === id))
    .filter(Boolean)
    .map((person) => ({ ...person, initial: person.name, name: nameOf(person.id) }))

  const tripExpenses = trip ? expenses.filter((expense) => expense.tripId === trip.id) : []

  const tripPayments = trip ? payments.filter((payment) => payment.tripId === trip.id) : []

  return { trip, travelers, tripExpenses, tripPayments, currentUserId, nameOf }
}
