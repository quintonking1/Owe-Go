import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useOutsideClick } from '../../hooks/useOutsideClick.js'
import { Icon } from '../Icon/Icon.jsx'
import './CurrencyPicker.css'

/**
 * A button that opens a list of currencies to choose from.
 *
 * Props:
 * - currencies: a list of { code, name }, e.g. { code: 'JPY', name: 'Japanese yen' }
 * - value: the chosen currency code
 * - onChange: called with the new code
 * - variant: 'pill' (small chip, used above an amount) or 'field' (a full-width
 *   row for inside a FieldGroup, showing a label and the currency name)
 * - label: for 'pill', what screen readers say (default "Currency: JPY. Change currency").
 *   For 'field', the small visible label (default "Home currency").
 *
 * Keyboard: Enter, Space or the arrow keys open the list. Arrow keys, Home
 * and End move through it. Enter or Space chooses. Escape closes.
 */
export function CurrencyPicker({ currencies, value, onChange, variant = 'pill', label }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const listId = useId()

  const selected = currencies.find((currency) => currency.code === value)

  const close = useCallback(() => setOpen(false), [])
  const closeAndRefocus = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useOutsideClick(rootRef, close, open)
  useEscapeKey(closeAndRefocus, open)

  // When the list opens, put focus on the chosen currency.
  useEffect(() => {
    if (!open) return
    const index = Math.max(0, currencies.findIndex((currency) => currency.code === value))
    optionRefs.current[index]?.focus()
  }, [open, currencies, value])

  function choose(code) {
    onChange(code)
    closeAndRefocus()
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleListKeyDown(event) {
    const current = optionRefs.current.indexOf(document.activeElement)
    const last = currencies.length - 1
    let next = null

    if (event.key === 'ArrowDown') next = Math.min(last, current + 1)
    else if (event.key === 'ArrowUp') next = Math.max(0, current - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else if (event.key === 'Tab') close()

    if (next !== null) {
      event.preventDefault()
      optionRefs.current[next]?.focus()
    }
  }

  const chevron = (
    <span className="currency-picker__chevron">
      <Icon name="chevron-down" size={variant === 'pill' ? 14 : 18} strokeWidth={variant === 'pill' ? 1.75 : 2} />
    </span>
  )

  return (
    <div
      className={`currency-picker currency-picker--${variant} ${open ? 'currency-picker--open' : ''}`.trim()}
      ref={rootRef}
    >
      {variant === 'pill' ? (
        <button
          type="button"
          ref={triggerRef}
          className="currency-picker__pill mono"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={label ?? `Currency: ${value}. Change currency`}
          onClick={() => setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
        >
          {value}
          {chevron}
        </button>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          className="currency-picker__field"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="currency-picker__field-text">
            <span className="currency-picker__field-label">{label ?? 'Home currency'}</span>
            <span className="currency-picker__field-value">
              <span className="currency-picker__field-code mono">{value}</span>
              {selected ? ` · ${selected.name}` : ''}
            </span>
          </span>
          {chevron}
        </button>
      )}

      {open && (
        // The options inside take the key presses; this handler only moves focus between them.
        // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
        <div
          className="currency-picker__list"
          role="listbox"
          id={listId}
          aria-label="Currency"
          onKeyDown={handleListKeyDown}
        >
          {currencies.map((currency, index) => {
            const isSelected = currency.code === value
            return (
              <button
                type="button"
                key={currency.code}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                className="currency-picker__option"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => choose(currency.code)}
              >
                <span className="currency-picker__option-code mono">{currency.code}</span>
                <span className="currency-picker__option-name">{currency.name}</span>
                {isSelected && (
                  <span className="currency-picker__check">
                    <Icon name="check" size={16} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** A currency code in the same pill shape, for a currency that can't be changed. */
export function CurrencyChip({ code }) {
  return <span className="currency-picker__pill currency-picker__pill--static mono">{code}</span>
}
