import { Link } from 'react-router-dom'
import { Icon } from '../Icon/Icon.jsx'
import './IconButton.css'

/**
 * A 36px round button holding only an icon (back arrow, close X).
 *
 * Props:
 * - icon: an Icon name, e.g. 'back' or 'close'
 * - label: required. Read out by screen readers, e.g. "Back to home"
 * - to: give a route to make it a link to another screen
 * Anything else (onClick, aria-*) is passed to the element.
 */
export function IconButton({ icon, label, to, className = '', ...rest }) {
  if (!label && import.meta.env.DEV) {
    console.error('IconButton needs a `label` so screen readers can announce it.')
  }

  const classes = `icon-button ${className}`.trim()
  const content = <Icon name={icon} size={16} strokeWidth={2} />

  if (to) {
    return (
      <Link className={classes} to={to} aria-label={label} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} aria-label={label} {...rest}>
      {content}
    </button>
  )
}
