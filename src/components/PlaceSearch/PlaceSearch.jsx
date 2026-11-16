import { useEffect, useId, useRef, useState } from 'react'
import { PlaceSearchUnavailableError, searchPlaces } from '../../lib/places.js'
import { Icon } from '../Icon/Icon.jsx'
import { SearchField } from '../SearchField/SearchField.jsx'
import './PlaceSearch.css'

/** Wait this long after the last key press before searching. */
const DEBOUNCE_MS = 250
const MIN_LENGTH = 2

/**
 * A search field that finds real cities and countries as you type, with
 * the matches listed underneath.
 *
 * Props:
 * - value: the text in the field
 * - place: the chosen place ({ id, name, region, country, countryCode, label }), or null
 * - onTextChange(text): the user typed. The parent should clear `place`.
 * - onPick(place): the user chose a match
 * - onUnavailable(boolean): the search service went down, or came back
 * - label, placeholder, error, describedBy: passed to SearchField
 *
 * Keyboard: arrow keys move through the matches, Enter chooses, Escape closes.
 */
export function PlaceSearch({
  value,
  place,
  onTextChange,
  onPick,
  onUnavailable,
  label = 'Destination',
  placeholder,
  error,
  describedBy,
}) {
  const listId = useId()
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // 'idle', 'loading', 'ready' or 'error'
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)

  // Read through a ref, so a new function from the parent doesn't restart the search.
  const onUnavailableRef = useRef(onUnavailable)
  useEffect(() => {
    onUnavailableRef.current = onUnavailable
  })

  const query = value.trim()
  const searching = !place && query.length >= MIN_LENGTH

  // Search a moment after typing stops. A newer search cancels the older one.
  useEffect(() => {
    if (!searching) return undefined
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setStatus('loading')
      try {
        const found = await searchPlaces(query, controller.signal)
        setResults(found)
        setActiveIndex(found.length > 0 ? 0 : -1)
        setStatus('ready')
        onUnavailableRef.current?.(false)
      } catch (searchError) {
        if (!(searchError instanceof PlaceSearchUnavailableError)) return
        setResults([])
        setStatus('error')
        onUnavailableRef.current?.(true)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, searching])

  const showList = open && searching && status !== 'idle'
  const hasResults = status === 'ready' && results.length > 0

  function choose(result) {
    onPick(result)
    setOpen(false)
    setResults([])
    setStatus('idle')
  }

  function handleKeyDown(event) {
    if (!showList || !hasResults) {
      if (event.key === 'Escape') setOpen(false)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(results.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  let message = ''
  if (status === 'loading' && results.length === 0) message = 'Searching…'
  if (status === 'ready' && results.length === 0) message = `No places match "${query}"`
  if (status === 'error') message = "Place search isn't available right now. You can keep what you typed."

  return (
    <div className="place-search">
      <SearchField
        variant="elevated"
        label={label}
        placeholder={placeholder}
        value={value}
        error={error}
        describedBy={describedBy}
        onChange={(text) => {
          setOpen(true)
          onTextChange(text)
        }}
        inputProps={{
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': showList && hasResults,
          'aria-controls': listId,
          'aria-activedescendant': showList && hasResults && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined,
          onKeyDown: handleKeyDown,
          onFocus: () => setOpen(true),
          onBlur: () => setOpen(false),
        }}
      />

      {/* Kept in the page so screen readers hear the status change. */}
      <p className="place-search__status" aria-live="polite">
        {showList ? message : ''}
      </p>

      <div className="place-search__list" role="listbox" id={listId} aria-label="Places" hidden={!(showList && hasResults)}>
        {hasResults &&
          results.map((result, index) => (
            <button
              type="button"
              key={result.id}
              id={`${listId}-${index}`}
              className="place-search__option"
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
              // Keep focus in the field, so the list doesn't close before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(result)}
            >
              <span className="place-search__pin">
                <Icon name={result.isCountry ? 'globe' : 'pin'} size={18} strokeWidth={1.75} />
              </span>
              <span className="place-search__text">
                <span className="place-search__name">{result.name}</span>
                <span className="place-search__where">
                  {result.isCountry ? 'Country' : [result.region, result.country].filter(Boolean).join(', ')}
                </span>
              </span>
            </button>
          ))}
      </div>
    </div>
  )
}
