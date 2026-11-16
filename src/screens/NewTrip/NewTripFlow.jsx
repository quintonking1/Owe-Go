import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppData } from '../../data/store.js'

/**
 * Holds the half-finished trip while the user moves between the two steps:
 *   /trips/new            step 1, where and when   (NewTripDetails)
 *   /trips/new/travelers  step 2, who is coming    (NewTripTravelers)
 * Nothing is saved until "Create trip" on step 2.
 */
export function NewTripFlow() {
  const { currentUserId } = useAppData()

  const [draft, setDraft] = useState({
    destination: '',
    // The place chosen from the search results, or null while typing.
    place: null,
    // True when place search is down, so a typed destination is allowed.
    placeSearchDown: false,
    name: '',
    startDate: '',
    endDate: '',
    homeCurrency: 'USD',
    // The organizer is always on the trip.
    travelerIds: [currentUserId],
    // People found by phone number, so they show in the list on step 2.
    invitedIds: [],
  })

  /** Change some fields of the draft, e.g. updateDraft({ name: 'Tokyo' }). */
  const updateDraft = (changes) => setDraft((current) => ({ ...current, ...changes }))

  return <Outlet context={{ draft, updateDraft }} />
}
