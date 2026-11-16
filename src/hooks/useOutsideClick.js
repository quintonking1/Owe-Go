import { useEffect } from 'react'

/**
 * Call `onOutside` when the user presses anywhere outside the element in
 * `ref`, while `active` is true. Used to close menus.
 */
export function useOutsideClick(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onOutside(event)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ref, onOutside, active])
}
