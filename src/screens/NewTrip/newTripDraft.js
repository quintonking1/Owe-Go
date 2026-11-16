import { useOutletContext } from 'react-router-dom'

/** For the step screens: gives { draft, updateDraft }. */
export function useNewTripDraft() {
  return useOutletContext()
}

/** What's wrong with step 1, if anything. Used by both steps. */
export function checkTripDetails(draft) {
  const problems = {}
  if (!draft.destination.trim()) problems.destination = "Add where you're going"
  if (!draft.name.trim()) problems.name = 'Give the trip a name'
  if (!draft.startDate || !draft.endDate) problems.dates = 'Pick a start and end date'
  else if (draft.endDate < draft.startDate) problems.dates = "End date can't be before the start date"
  return problems
}
