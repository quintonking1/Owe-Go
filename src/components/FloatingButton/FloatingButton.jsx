import { Link } from 'react-router-dom'
import { Icon } from '../Icon/Icon.jsx'
import './FloatingButton.css'

/**
 * The dark pill that floats above the tab bar, e.g. "Add expense".
 * It positions itself against the nearest ancestor with `position: relative`,
 * which should be the screen.
 *
 * Props:
 * - children: the label
 * - icon: Icon name shown before the label (default 'plus')
 * - to: route to open. Or pass onClick to handle the press yourself.
 */
export function FloatingButton({ children, icon = 'plus', to, ...rest }) {
  const content = (
    <>
      <Icon name={icon} size={18} strokeWidth={2.25} />
      {children}
    </>
  )

  if (to) {
    return (
      <Link className="floating-button" to={to} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className="floating-button" {...rest}>
      {content}
    </button>
  )
}
