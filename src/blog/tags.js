import { tagToSlug } from './frontmatter.js'

export { tagToSlug }

/**
 * @typedef {import('./content').BlogPostIndexItem} BlogPostIndexItem
 */

/**
 * Filter posts by normalized tag slug.
 *
 * @param {readonly BlogPostIndexItem[]} posts
 * @param {string} tagSlug
 * @returns {readonly BlogPostIndexItem[]}
 */
export function filterPostsByTag(posts, tagSlug) {
  if (tagSlug.length === 0) return []
  return posts.filter((post) =>
    (post.tags ?? []).some((tag) => tagToSlug(tag) === tagSlug),
  )
}

/**
 * Build in-app href for a tag archive page.
 * @param {string} tagSlug
 * @returns {string}
 */
export function tagHref(tagSlug) {
  if (tagSlug.length === 0) return '/tags'
  return `/tags/${tagSlug}`
}
