import { useEffect } from 'react'

/** Call `onEscape` when the Escape key is pressed, while `active` is true. */
export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onEscape(event)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, active])
}
