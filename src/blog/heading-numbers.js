/**
 * @typedef {object} HeadingNumberState
 * @property {number} h2
 * @property {number} h3
 * @property {number} h4
 */

/**
 * @param {string} text
 * @returns {string}
 */
export function stripLeadingNumber(text) {
  return text.replace(/^\d+(?:\.\d+)*\.?\s+/, '').trim()
}

/**
 * Advance counters for a heading level and return its display number.
 *
 * @param {2 | 3 | 4} level
 * @param {HeadingNumberState} state
 * @returns {string}
 */
export function nextHeadingNumber(level, state) {
  if (level === 2) {
    state.h2 += 1
    state.h3 = 0
    state.h4 = 0
    return `${state.h2}`
  }

  if (state.h2 === 0) state.h2 = 1

  if (level === 3) {
    state.h3 += 1
    state.h4 = 0
    return `${state.h2}.${state.h3}`
  }

  if (state.h3 === 0) state.h3 = 1
  state.h4 += 1
  return `${state.h2}.${state.h3}.${state.h4}`
}

/**
 * @typedef {import('./toc').TocItem} TocItem
 * @typedef {TocItem & { number: string }} NumberedTocItem
 */

/**
 * Attach hierarchical numbers to TOC items.
 *
 * @param {readonly TocItem[]} items
 * @returns {readonly NumberedTocItem[]}
 */
export function numberTocItems(items) {
  /** @type {HeadingNumberState} */
  const state = { h2: 0, h3: 0, h4: 0 }

  return items.map((item) => ({
    ...item,
    number: nextHeadingNumber(item.level, state),
  }))
}
