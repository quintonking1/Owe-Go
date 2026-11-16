import { Icon } from '../Icon/Icon.jsx'
import './Alert.css'

/**
 * A quiet box for a problem the user should know about, such as
 * "Rates unavailable".
 *
 * Props:
 * - title: the bold first line
 * - children: the explanation underneath
 * - action: optional element on the right, such as a Retry link button
 */
export function Alert({ title, children, action }) {
  return (
    <div className="alert" role="alert">
      <span className="alert__icon">
        <Icon name="alert" size={18} strokeWidth={2} />
      </span>
      <div className="alert__text">
        <span className="alert__title">{title}</span>
        {children && <span className="alert__body">{children}</span>}
      </div>
      {action && <div className="alert__action">{action}</div>}
    </div>
  )
}
