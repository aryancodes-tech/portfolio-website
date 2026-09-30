/**
 * Hosts that should increment the public visitor counter.
 * Local and preview hosts only read the current value.
 * @type {readonly string[]}
 */
export const VISITOR_COUNT_HOSTS = ['aryancodes.tech', 'www.aryancodes.tech']

/** Abacus namespace for this site. @type {string} */
export const VISITOR_COUNTER_NAMESPACE = 'aryancodes.tech'

/** Abacus key for the portfolio page. @type {string} */
export const VISITOR_COUNTER_KEY = 'portfolio'

/** Public counter origin. No first-party backend. @type {string} */
export const VISITOR_COUNTER_ORIGIN = 'https://abacus.jasoncameron.dev'

/**
 * @param {'hit' | 'get'} action `hit` increments, `get` only reads.
 * @returns {string}
 */
export function visitorCounterUrl(action) {
  return `${VISITOR_COUNTER_ORIGIN}/${action}/${VISITOR_COUNTER_NAMESPACE}/${VISITOR_COUNTER_KEY}`
}
