import { Link } from 'react-router-dom'
import './Button.css'

/**
 * A button, or a link that looks like one.
 *
 * Props:
 * - variant: 'primary' (blue), 'dark', 'outline' or 'link' (underlined text)
 * - size: 'md' (44px) or 'lg' (48px)
 * - fullWidth: stretch to the width of the container
 * - to: give a route to make it a link to another screen
 * - disabled: greys it out and blocks presses
 * Anything else (onClick, type, aria-*) is passed to the element.
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  to,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // A link can't be disabled, so a disabled button is always a real <button>.
  if (to && !disabled) {
    return (
      <Link className={classes} to={to} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
