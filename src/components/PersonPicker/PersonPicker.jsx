import { Avatar } from '../Avatar/Avatar.jsx'
import { Icon } from '../Icon/Icon.jsx'
import { InlineError } from '../InlineError/InlineError.jsx'
import './PersonPicker.css'

/**
 * A row of people to tap on or off.
 *
 * Props:
 * - legend: the heading, e.g. "Paid by" or "Split equally between"
 * - people: a list of { id, name, color }
 * - mode: 'single' (pick exactly one, for "Paid by") or 'multiple' (pick any
 *   number, for the split). 'multiple' also shows Select all / Clear.
 * - value: the chosen id for 'single', or a list of chosen ids for 'multiple'
 * - onChange: called with the new id, or the new list of ids
 * - error: optional message. Turns the heading red and shows it underneath.
 */
export function PersonPicker({ legend, people, mode = 'single', value, onChange, error }) {
  const multiple = mode === 'multiple'
  const selectedIds = multiple ? value : [value]
  const allSelected = multiple && people.length > 0 && people.every((person) => value.includes(person.id))

  function toggle(id) {
    if (!multiple) {
      onChange(id)
    } else if (value.includes(id)) {
      onChange(value.filter((selectedId) => selectedId !== id))
    } else {
      onChange([...value, id])
    }
  }

  function toggleAll() {
    onChange(allSelected ? [] : people.map((person) => person.id))
  }

  return (
    <fieldset className={`person-picker ${error ? 'person-picker--error' : ''}`.trim()}>
      <legend className="person-picker__legend">
        <span className="person-picker__legend-text">{legend}</span>
        {multiple && (
          <button type="button" className="person-picker__all" onClick={toggleAll}>
            {allSelected ? 'Clear' : 'Select all'}
          </button>
        )}
      </legend>

      <div className="person-picker__people">
        {people.map((person) => {
          const selected = selectedIds.includes(person.id)
          return (
            <button
              type="button"
              key={person.id}
              className={`person-picker__person ${selected ? 'person-picker__person--selected' : ''}`.trim()}
              aria-pressed={selected}
              aria-label={person.name}
              onClick={() => toggle(person.id)}
            >
              <span className="person-picker__avatar">
                <Avatar name={person.initial ?? person.name} color={person.color} size="lg" />
                {selected && (
                  <span className="person-picker__badge" aria-hidden="true">
                    <Icon name="check" size={11} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="person-picker__name">{person.name}</span>
            </button>
          )
        })}
      </div>

      {error && <InlineError>{error}</InlineError>}
    </fieldset>
  )
}
