import { useEffect } from 'react'

let lockCount = 0

/**
 * Stop the page behind a sheet from scrolling while `active` is true.
 * Counts locks so two open sheets don't unlock each other.
 * The .scroll-locked rule lives in base.css.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined

    lockCount += 1
    document.documentElement.classList.add('scroll-locked')

    return () => {
      lockCount -= 1
      if (lockCount === 0) document.documentElement.classList.remove('scroll-locked')
    }
  }, [active])
}
