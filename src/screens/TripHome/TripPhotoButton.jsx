import { useRef } from 'react'
import { Icon } from '../../components/Icon/Icon.jsx'
import { InlineError } from '../../components/InlineError/InlineError.jsx'
import { setTripPhoto } from '../../data/store.js'
import { shrinkImage } from '../../lib/image.js'
import './TripPhotoButton.css'

/**
 * The camera button in the corner of the trip photo. It opens the device's
 * photo picker, shrinks the chosen image and saves it on the trip, so Home
 * and the Trips tab both show it. Everything stays in localStorage.
 *
 * Props: trip, status ({ state: idle/saving/error, message }), onStatus.
 */
export function TripPhotoButton({ trip, status, onStatus }) {
  const inputRef = useRef(null)
  const hasPhoto = Boolean(trip.photo)
  const busy = status.state === 'saving'

  async function handleChange(event) {
    const file = event.target.files?.[0]
    // Clear the input so picking the same file again still fires a change.
    event.target.value = ''
    if (!file) return

    onStatus({ state: 'saving' })
    try {
      const photo = await shrinkImage(file)
      setTripPhoto(trip.id, photo)
      onStatus({ state: 'idle' })
    } catch (error) {
      onStatus({ state: 'error', message: error.message })
    }
  }

  return (
    <>
      <button
        type="button"
        className={`trip-photo-button ${hasPhoto ? '' : 'trip-photo-button--labelled'}`.trim()}
        aria-label={hasPhoto ? 'Change trip photo' : undefined}
        aria-describedby={status.state === 'error' ? 'trip-photo-error' : undefined}
        aria-busy={busy}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Icon name="camera" size={18} strokeWidth={2} />
        {!hasPhoto && <span>{busy ? 'Adding…' : 'Add photo'}</span>}
      </button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
    </>
  )
}

/** The message under the trip name when a photo could not be added. */
export function TripPhotoError({ status }) {
  if (status.state !== 'error') return null
  return <InlineError id="trip-photo-error">{status.message} Try another photo.</InlineError>
}
