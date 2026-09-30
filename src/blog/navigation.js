/**
 * @typedef {import('./content').BlogPostIndexItem} BlogPostIndexItem
 */

/**
 * @typedef {object} BlogPostNavigation
 * @property {BlogPostIndexItem | null} previous Earlier post by publish date.
 * @property {BlogPostIndexItem | null} next Later post by publish date.
 */

/**
 * Flatten published posts sorted newest-first for index display.
 * @param {readonly import('./content').BlogIndexItem[]} items
 * @returns {readonly BlogPostIndexItem[]}
 */
export function flattenPublishedPosts(items) {
  /** @type {BlogPostIndexItem[]} */
  const posts = []
  for (const item of items) {
    if (item.type === 'standalone') {
      posts.push(item.post)
      continue
    }
    for (const post of item.posts) {
      posts.push(post)
    }
  }
  return posts
}

/**
 * Chronological prev/next navigation for a post.
 *
 * @param {BlogPostIndexItem} active Current post.
 * @param {readonly BlogPostIndexItem[]} catalog Flattened published posts.
 * @returns {BlogPostNavigation}
 */
export function getPostNavigation(active, catalog) {
  const sorted = catalog
    .slice()
    .sort((a, b) => (a.dateISO ?? '').localeCompare(b.dateISO ?? ''))

  const index = sorted.findIndex((p) => p.path === active.path)
  if (index === -1) {
    return { previous: null, next: null }
  }

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  }
}

/**
 * Latest posts by publish date (newest first).
 *
 * @param {readonly BlogPostIndexItem[]} catalog
 * @param {number} [limit=3]
 * @returns {readonly BlogPostIndexItem[]}
 */
export function getLatestPosts(catalog, limit = 3) {
  return catalog
    .slice()
    .sort((a, b) => (b.dateISO ?? '').localeCompare(a.dateISO ?? ''))
    .slice(0, limit)
}

/**
 * Featured post (explicit flag) or newest published post.
 *
 * @param {readonly import('./content').BlogDoc[]} docs
 * @param {readonly BlogPostIndexItem[]} catalog
 * @returns {BlogPostIndexItem | null}
 */
export function getFeaturedPost(docs, catalog) {
  const featuredDoc = docs.find((d) => d.frontmatter.featured === true)
  if (featuredDoc) {
    return catalog.find((p) => p.path === featuredDoc.path) ?? null
  }
  return getLatestPosts(catalog, 1)[0] ?? null
}
