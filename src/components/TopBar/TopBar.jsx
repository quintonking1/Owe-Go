import { IconButton } from '../IconButton/IconButton.jsx'
import './TopBar.css'

/**
 * The bar at the top of a screen: a back or close button, then the title.
 *
 * Props:
 * - action: 'back' or 'close' (which button to show)
 * - actionLabel: what screen readers say for the button, e.g. "Back to home"
 * - to: route the button links to. Or pass onAction to handle the press.
 * - title: optional screen title
 * - subtitle: optional small line under the title
 * - align: 'center' or 'start'. By default a close bar is centered and a
 *   back bar is left-aligned, as in the designs.
 */
export function TopBar({ action = 'back', actionLabel, to, onAction, title, subtitle, align }) {
  const alignment = align ?? (action === 'close' ? 'center' : 'start')
  const label = actionLabel ?? (action === 'close' ? 'Close' : 'Back')

  return (
    <header className={`top-bar top-bar--${alignment}`}>
      <IconButton icon={action} label={label} to={to} onClick={onAction} />
      {title && (
        <div className="top-bar__text">
          <h1 className="top-bar__title">{title}</h1>
          {subtitle && <p className="top-bar__subtitle">{subtitle}</p>}
        </div>
      )}
      {/* Empty slot the same width as the button, so a centered title stays centered. */}
      {alignment === 'center' && <span className="top-bar__spacer" />}
    </header>
  )
}
