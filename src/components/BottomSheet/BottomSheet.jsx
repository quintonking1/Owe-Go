import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useScrollLock } from '../../hooks/useScrollLock.js'
import './BottomSheet.css'

/**
 * A panel that slides up from the bottom over a dimmed screen.
 *
 * Props:
 * - open: whether the sheet is showing
 * - onClose: called when the user presses Escape or taps the dimmed area
 * - title: heading at the top of the sheet. Screen readers announce it.
 * - subtitle: optional line under the title
 * - ariaLabel: name for screen readers when there is no visible title
 * - showHandle: show the small grab handle (default true)
 * - closeLabel: what screen readers say for the dimmed area (default "Close")
 *
 * While open it keeps keyboard focus inside, stops the page behind from
 * scrolling, and hands focus back to the button that opened it on close.
 */
export function BottomSheet({ open, ...props }) {
  if (!open) return null
  return createPortal(<Sheet {...props} />, document.body)
}

function Sheet({ onClose, title, subtitle, ariaLabel, showHandle = true, closeLabel = 'Close', children }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useFocusTrap(panelRef)
  useScrollLock()
  useEscapeKey(onClose)

  return (
    <div className="bottom-sheet">
      {/* A real button, but out of the Tab order: keyboard users close with Escape. */}
      <button
        type="button"
        className="bottom-sheet__backdrop"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
      />
      <section
        ref={panelRef}
        className="bottom-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
      >
        {showHandle && <span className="bottom-sheet__handle" aria-hidden="true" />}
        {title && (
          <div className="bottom-sheet__heading">
            <h2 className="bottom-sheet__title" id={titleId}>
              {title}
            </h2>
            {subtitle && <p className="bottom-sheet__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </section>
    </div>
  )
}
