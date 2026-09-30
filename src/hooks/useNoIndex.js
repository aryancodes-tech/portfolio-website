import { useEffect } from 'react'

/** Marks the current document noindex, and restores the previous robots policy on leave. */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      return undefined
    }
    const previous = meta.getAttribute('content')
    meta.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (previous !== null && previous.length > 0) {
        meta.setAttribute('content', previous)
      }
    }
  }, [])
}
