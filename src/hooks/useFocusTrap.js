import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keep keyboard focus inside the element in `ref` while `active` is true.
 * - Moves focus into the element when it opens.
 * - Tab and Shift+Tab loop around inside it.
 * - Gives focus back to whatever had it before, when it closes.
 */
export function useFocusTrap(ref, active = true) {
  useEffect(() => {
    const container = ref.current
    if (!active || !container) return undefined

    const previouslyFocused = document.activeElement
    container.focus()

    function handleKeyDown(event) {
      if (event.key !== 'Tab') return

      // Skip anything taken out of the Tab order on purpose (tabindex="-1").
      const focusable = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.tabIndex >= 0,
      )
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement

      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      } else if (!container.contains(current)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [ref, active])
}
