import { ROLE_KIND_FULL_TIME } from '../roles'

/** Months in a calendar year. @type {number} */
const MONTHS_IN_YEAR = 12

/** Shown when a role has no end date. @type {string} */
export const PRESENT_LABEL = 'Present'

/** Short month names, January = index 0. @type {readonly string[]} */
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * @typedef {Object} TenureRole
 * @property {string} start First day worked, `YYYY-MM-DD`.
 * @property {string} rangeEnd Exclusive end, `YYYY-MM-DD`. Empty string means today.
 * @property {string} kind `full-time` or `internship`.
 */

/**
 * @param {string} iso
 * @returns {{ year: number, month: number, day: number }}
 */
function parseISODateParts(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month, day }
}

/**
 * @returns {{ year: number, month: number, day: number }}
 */
function todayParts() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

/**
 * @param {{ year: number, month: number, day: number }} parts
 * @param {number} offset
 * @returns {string}
 */
function monthKey(parts, offset) {
  const date = new Date(parts.year, parts.month - 1 + offset, 1)
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

/**
 * Whole months from `start` inclusive to `rangeEnd` exclusive.
 * An empty `rangeEnd` uses today's date as the exclusive bound's stand-in,
 * and the current month counts once today's day is on or after the start day.
 * @param {string} startISO
 * @param {string} rangeEndISO
 * @returns {number}
 */
export function monthsBetween(startISO, rangeEndISO) {
  if (startISO.length === 0) {
    return 0
  }
  const start = parseISODateParts(startISO)
  const end = rangeEndISO.length === 0 ? todayParts() : parseISODateParts(rangeEndISO)
  let months = (end.year - start.year) * MONTHS_IN_YEAR + (end.month - start.month)
  if (end.day < start.day) {
    months -= 1
  }
  return Math.max(0, months)
}

/**
 * Unique months covered by the roles. Overlapping months count once.
 * @param {readonly TenureRole[]} roles
 * @returns {number}
 */
export function totalMonths(roles) {
  const covered = new Set()
  for (const role of roles) {
    const count = monthsBetween(role.start, role.rangeEnd)
    const start = parseISODateParts(role.start)
    for (let offset = 0; offset < count; offset += 1) {
      covered.add(monthKey(start, offset))
    }
  }
  return covered.size
}

/**
 * @param {number} total
 * @returns {string}
 */
export function formatTenure(total) {
  const years = Math.floor(total / MONTHS_IN_YEAR)
  const months = total % MONTHS_IN_YEAR
  /** @type {string[]} */
  const parts = []
  if (years === 1) {
    parts.push('1 year')
  } else if (years > 1) {
    parts.push(`${years} years`)
  }
  if (months === 1) {
    parts.push('1 month')
  } else if (months > 1) {
    parts.push(`${months} months`)
  }
  if (parts.length === 0) {
    return '0 months'
  }
  return parts.join(' ')
}

/**
 * @param {string} iso `YYYY-MM-DD`, or empty for {@link PRESENT_LABEL}.
 * @returns {string}
 */
export function formatMonthYear(iso) {
  if (iso.length === 0) {
    return PRESENT_LABEL
  }
  const { year, month } = parseISODateParts(iso)
  return `${MONTH_LABELS[month - 1]} ${year}`
}

/**
 * @param {string} start
 * @param {string} until Display end month, or empty for the present.
 * @returns {string}
 */
export function formatRoleRange(start, until) {
  return `${formatMonthYear(start)} — ${formatMonthYear(until)}`
}

/**
 * Tenure totals for the hero pills.
 * @param {readonly TenureRole[]} roles
 * @returns {{ fullTime: string, withInternships: string }}
 */
export function describeTenure(roles) {
  const fullTimeRoles = roles.filter((role) => role.kind === ROLE_KIND_FULL_TIME)
  return {
    fullTime: formatTenure(totalMonths(fullTimeRoles)),
    withInternships: formatTenure(totalMonths(roles)),
  }
}
