import { useEffect, useState } from 'react'
import { VISITOR_COUNT_HOSTS, visitorCounterUrl } from '../constants/visitors'

/**
 * Reads a public hit counter. Production hosts increment it; everywhere else only reads.
 * Returns null until a number arrives, and stays null if the request fails.
 * @returns {number | null}
 */
export function useVisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const countVisit = VISITOR_COUNT_HOSTS.includes(window.location.hostname)
    const url = visitorCounterUrl(countVisit ? 'hit' : 'get')
    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && typeof data.value === 'number') {
          setCount(data.value)
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  return count
}
