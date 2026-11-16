import './AmountInput.css'

/**
 * A big amount field: currency symbol, then the number, on an underline.
 *
 * Props:
 * - value: the text in the field (keep it as a string while typing)
 * - onChange: called with the new text
 * - symbol: the currency symbol shown in front, e.g. "¥"
 * - label: what screen readers say, e.g. "Amount in JPY"
 * - error: true turns the underline red
 * - describedBy: id of the error message that explains what's wrong
 */
export function AmountInput({ value, onChange, symbol, label, error = false, describedBy, placeholder = '0' }) {
  return (
    <label className={`amount-input ${error ? 'amount-input--error' : ''}`.trim()}>
      <span className="amount-input__symbol mono" aria-hidden="true">
        {symbol}
      </span>
      <input
        className="amount-input__field mono"
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

/**
 * An amount shown in the same large type, but not editable. Used for the
 * converted home-currency amount beside the input.
 *
 * Props: children (the formatted amount), muted (grey, for "no rate yet").
 */
export function AmountDisplay({ children, muted = false }) {
  return (
    <output className={`amount-display mono ${muted ? 'amount-display--muted' : ''}`.trim()}>
      {children}
    </output>
  )
}
