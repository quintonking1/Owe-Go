import { Icon } from '../Icon/Icon.jsx'
import './InlineError.css'

/**
 * A red icon and a short message, shown under a field that needs fixing.
 * Screen readers announce it as soon as it appears.
 *
 * Props: id (so a field can point to it with aria-describedby), children.
 */
export function InlineError({ id, children }) {
  return (
    <p className="inline-error" role="alert" id={id}>
      <Icon name="alert" size={14} strokeWidth={2} />
      <span>{children}</span>
    </p>
  )
}
