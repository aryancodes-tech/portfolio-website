/**
 * Full-time employment. Counted in both tenure pills.
 * @type {'full-time'}
 */
export const ROLE_KIND_FULL_TIME = 'full-time'

/**
 * Internship. Counted only in the "with internships" tenure pill.
 * @type {'internship'}
 */
export const ROLE_KIND_INTERNSHIP = 'internship'

/**
 * Employment type shown under a role title.
 * @type {Record<string, string>}
 */
export const ROLE_KIND_LABELS = {
  [ROLE_KIND_FULL_TIME]: 'Full-time',
  [ROLE_KIND_INTERNSHIP]: 'Internship',
}
