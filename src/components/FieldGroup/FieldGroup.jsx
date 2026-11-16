import { useId } from 'react'
import { Icon } from '../Icon/Icon.jsx'
import { InlineError } from '../InlineError/InlineError.jsx'
import './FieldGroup.css'

/**
 * A rounded box that holds several fields, with thin lines between them.
 * Build it from rows:
 *
 *   <FieldGroup>
 *     <FieldRow>
 *       <TextField wide label="What for" ... />
 *       <ButtonField label="Date" ... />
 *     </FieldRow>
 *     <FieldRow> ...another row, stacked underneath... </FieldRow>
 *   </FieldGroup>
 */
export function FieldGroup({ children }) {
  return <div className="field-group">{children}</div>
}

/** One row in a FieldGroup. Fields inside it sit side by side. */
export function FieldRow({ children }) {
  return <div className="field-row">{children}</div>
}

/**
 * A labeled text input.
 *
 * Props:
 * - label, value, onChange (called with the new text), placeholder
 * - error: optional message. Turns the label red and shows it under the input.
 * - wide: take more of the row than the field next to it
 */
export function TextField({ label, value, onChange, placeholder, error, wide = false, ...rest }) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={`field ${wide ? 'field--wide' : ''} ${error ? 'field--error' : ''}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field__input"
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
      {error && <InlineError id={errorId}>{error}</InlineError>}
    </div>
  )
}

/**
 * A field that opens something else when pressed, such as the date sheet.
 *
 * Props:
 * - label: the small label, e.g. "Date"
 * - value: the text to show, e.g. "Nov 5". Leave empty to show the placeholder.
 * - placeholder: grey text shown when there is no value, e.g. "Add dates"
 * - icon: Icon name on the right (default 'calendar')
 * - onClick: what to open
 * - ariaLabel: fuller description, e.g. "Date paid: Nov 5. Change date"
 * - hasPopup: what it opens, for screen readers (default 'dialog')
 * - error: true turns the label red
 */
export function ButtonField({
  label,
  value,
  placeholder,
  icon = 'calendar',
  onClick,
  ariaLabel,
  hasPopup = 'dialog',
  error = false,
}) {
  return (
    <div className={`field field--button ${error ? 'field--error' : ''}`.trim()}>
      <button
        type="button"
        className="field__button"
        aria-haspopup={hasPopup}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <span className="field__button-text">
          <span className="field__label">{label}</span>
          <span className={`field__value ${value ? '' : 'field__value--empty'}`.trim()}>
            {value || placeholder}
          </span>
        </span>
        <span className="field__icon">
          <Icon name={icon} size={18} strokeWidth={1.75} />
        </span>
      </button>
    </div>
  )
}

/** A full-width row for an error message that belongs to the row above it. */
export function FieldMessage({ children }) {
  return (
    <div className="field-row field-row--message">
      <InlineError>{children}</InlineError>
    </div>
  )
}
