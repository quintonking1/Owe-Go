import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar/Avatar.jsx'
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.jsx'
import { Button } from '../../components/Button/Button.jsx'
import { FieldGroup, FieldRow, TextField } from '../../components/FieldGroup/FieldGroup.jsx'
import { Icon } from '../../components/Icon/Icon.jsx'
import { ProgressSteps } from '../../components/ProgressSteps/ProgressSteps.jsx'
import { Screen } from '../../components/Screen/Screen.jsx'
import { SearchField } from '../../components/SearchField/SearchField.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import { currencyForCountry } from '../../data/currencies.js'
import { addTrip, useAppData } from '../../data/store.js'
import { checkTripDetails, useNewTripDraft } from './newTripDraft.js'
import './NewTrip.css'

/** Keep only the digits, and drop a leading US "1", so "+1 (510) 555-0155" matches "5105550155". */
function normalizePhone(text) {
  const digits = text.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

/** New trip, step 2: choose who is coming, then create the trip. */
export function NewTripTravelers() {
  const { currentUserId, people } = useAppData()
  const { draft, updateDraft } = useNewTripDraft()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  // Opened directly, or after a refresh: step 1 isn't filled in, so go back to it.
  if (Object.keys(checkTripDetails(draft)).length > 0) return <Navigate to="/trips/new" replace />

  const organizer = people.find((person) => person.id === currentUserId)
  // Friends, plus anyone found by phone number during this flow.
  const candidates = people.filter(
    (person) => person.id !== currentUserId && (person.friend || draft.invitedIds.includes(person.id)),
  )
  const query = search.trim().toLowerCase()
  const shown = candidates.filter((person) => person.name.toLowerCase().includes(query))

  function toggle(id) {
    const travelerIds = draft.travelerIds.includes(id)
      ? draft.travelerIds.filter((travelerId) => travelerId !== id)
      : [...draft.travelerIds, id]
    updateDraft({ travelerIds })
  }

  function addInvited(person) {
    updateDraft({
      invitedIds: draft.invitedIds.includes(person.id) ? draft.invitedIds : [...draft.invitedIds, person.id],
      travelerIds: draft.travelerIds.includes(person.id) ? draft.travelerIds : [...draft.travelerIds, person.id],
    })
    setSearch('')
    setInviteOpen(false)
  }

  function createTrip() {
    addTrip({
      name: draft.name.trim(),
      destination: draft.destination.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      homeCurrency: draft.homeCurrency,
      // From the chosen place. New expenses start in it. Null if unknown.
      localCurrency: currencyForCountry(draft.place?.countryCode),
      travelerIds: draft.travelerIds,
    })
    // The new trip is now the current trip, so Home shows it, empty.
    navigate('/')
  }

  return (
    <Screen>
      <TopBar action="back" to="/trips/new" />

      <main className="new-trip__main new-trip__main--travelers">
        <h1 className="new-trip__title">Who is coming?</h1>

        <SearchField label="Find travelers" placeholder="Search friends" value={search} onChange={setSearch} />

        <ul className="new-trip__people">
          {organizer && !query && (
            <li className="new-trip__person">
              <Avatar name={organizer.name} color={organizer.color} size="lg" />
              <span className="new-trip__person-text">
                <span className="new-trip__person-name">{organizer.name}</span>
                <span className="new-trip__person-note">You</span>
              </span>
              <span className="new-trip__person-note">Organizer</span>
            </li>
          )}

          {shown.map((person) => {
            const coming = draft.travelerIds.includes(person.id)
            return (
              <li key={person.id} className="new-trip__person">
                <Avatar name={person.name} color={person.color} size="lg" />
                <span className="new-trip__person-text">
                  <span className="new-trip__person-name">{person.name}</span>
                  <span className="new-trip__person-note">{person.friend ? 'Friend' : 'Invited by phone'}</span>
                </span>
                <button
                  type="button"
                  className={`new-trip__toggle ${coming ? 'new-trip__toggle--on' : ''}`.trim()}
                  aria-pressed={coming}
                  aria-label={coming ? `Remove ${person.name}` : `Add ${person.name}`}
                  onClick={() => toggle(person.id)}
                >
                  <Icon name={coming ? 'check' : 'plus'} size={16} strokeWidth={2.25} />
                </button>
              </li>
            )
          })}
        </ul>

        {query && shown.length === 0 && (
          <p className="new-trip__help" role="status">
            No friends match "{search.trim()}".
          </p>
        )}

        <div>
          <Button variant="link" onClick={() => setInviteOpen(true)}>
            Invite someone by phone number
          </Button>
        </div>
      </main>

      <footer className="new-trip__footer">
        <ProgressSteps current={2} total={3} />
        <div className="new-trip__footer-actions">
          <Button variant="link" to="/trips/new">
            Back
          </Button>
          <Button variant="dark" onClick={createTrip}>
            Create trip
          </Button>
        </div>
      </footer>

      <InviteSheet
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        people={people.filter((person) => person.id !== currentUserId)}
        onFound={addInvited}
      />
    </Screen>
  )
}

/**
 * Add a traveler by phone number. There is no backend, so this only looks
 * through the accounts in the demo data.
 */
function InviteSheet({ open, onClose, people, onFound }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function close() {
    setPhone('')
    setError('')
    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()
    const digits = normalizePhone(phone)
    if (digits.length < 10) {
      setError('Enter a 10-digit phone number')
      return
    }
    const person = people.find((candidate) => candidate.phone === digits)
    if (!person) {
      setError('No Owe & Go account uses that number')
      return
    }
    setPhone('')
    setError('')
    onFound(person)
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="Invite by phone number"
      subtitle="They need an Owe & Go account already."
    >
      <form className="new-trip__invite" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FieldRow>
            <TextField
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(510) 555-0155"
              value={phone}
              onChange={(value) => {
                setPhone(value)
                setError('')
              }}
              error={error || undefined}
            />
          </FieldRow>
        </FieldGroup>
        <p className="new-trip__help">Demo: Leo has an account at (510) 555-0155.</p>
        <div className="new-trip__sheet-footer">
          <Button variant="link" onClick={close}>
            Cancel
          </Button>
          <Button variant="dark" type="submit">
            Add traveler
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
