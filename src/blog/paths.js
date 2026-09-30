import { BLOG_PATH } from '../constants/urls.js'

/**
 * Build an in-app URL for a blog entry or post.
 *
 * @param {string} entrySlug Topic folder or standalone slug.
 * @param {string} [postSlug] Post slug within a series; omit for standalone entries.
 * @returns {string}
 */
export function blogPostHref(entrySlug, postSlug = '') {
  if (entrySlug.length === 0) return BLOG_PATH
  if (postSlug.length === 0) return `${BLOG_PATH}/${entrySlug}`
  return `${BLOG_PATH}/${entrySlug}/${postSlug}`
}
