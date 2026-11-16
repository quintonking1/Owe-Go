import { useId, useState } from 'react'
import { Icon } from '../Icon/Icon.jsx'
import './Collapsible.css'

/**
 * A row that shows or hides the content under it, e.g. "How we got $X".
 * It starts closed unless you say otherwise.
 *
 * Props:
 * - title: the text on the toggle row
 * - children: the content to show when open
 * - defaultOpen: start open (default false)
 * - open, onOpenChange: optional, if the parent wants to control it
 */
export function Collapsible({ title, children, defaultOpen = false, open, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const contentId = useId()

  const isOpen = open ?? internalOpen

  function toggle() {
    setInternalOpen(!isOpen)
    onOpenChange?.(!isOpen)
  }

  return (
    <div className={`collapsible ${isOpen ? 'collapsible--open' : ''}`.trim()}>
      <button
        type="button"
        className="collapsible__toggle"
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        onClick={toggle}
      >
        {title}
        <span className="collapsible__chevron">
          <Icon name="chevron-down" size={18} strokeWidth={2} />
        </span>
      </button>
      {isOpen && (
        <div className="collapsible__content" id={contentId}>
          {children}
        </div>
      )}
    </div>
  )
}
