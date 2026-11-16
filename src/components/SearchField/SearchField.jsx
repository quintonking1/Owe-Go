import { Icon } from '../Icon/Icon.jsx'
import './SearchField.css'

/**
 * A pill-shaped text field with a search icon.
 *
 * Props:
 * - label: what screen readers call the field, e.g. "Destination"
 * - value, onChange (called with the new text), placeholder
 * - variant: 'elevated' (56px with a shadow, for the main question on a
 *   screen) or 'plain' (52px, for filtering a list)
 * - error: true turns the border red
 * - describedBy: id of the error message that explains what's wrong
 * - inputProps: anything else for the <input>, e.g. combobox ARIA and onKeyDown
 */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  variant = 'plain',
  error = false,
  describedBy,
  inputProps,
}) {
  return (
    <label className={`search-field search-field--${variant} ${error ? 'search-field--error' : ''}`.trim()}>
      <Icon name="search" size={variant === 'elevated' ? 20 : 18} strokeWidth={2} />
      <input
        className="search-field__input"
        type="text"
        aria-label={label}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  )
}
