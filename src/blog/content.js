import DOMPurify from 'dompurify'
import { BLOG_MANIFEST } from '../constants/blog.manifest'
import { applyBlogPinning } from './applyPinning'
import { parseFrontmatter } from './frontmatter'
import { renderMarkdownHtml } from './markdown'

/**
 * @typedef {import('./frontmatter').BlogFrontmatter} BlogFrontmatter
 */

/**
 * @typedef {object} BlogDoc
 * @property {string} entrySlug
 * @property {string} postSlug
 * @property {string} path
 * @property {BlogFrontmatter} frontmatter
 * @property {string} markdown
 */

/**
 * @typedef {object} BlogPostIndexItem
 * @property {string} entrySlug
 * @property {string} postSlug
 * @property {string} title
 * @property {string} description
 * @property {string} dateISO
 * @property {readonly string[]} tags
 * @property {string} [category]
 * @property {string} path
 */

/**
 * @typedef {object} BlogSeriesIndexItem
 * @property {'series'} type
 * @property {string} entrySlug
 * @property {string} title
 * @property {readonly string[]} tags
 * @property {readonly BlogPostIndexItem[]} posts
 * @property {boolean} [pinned]
 */

/**
 * @typedef {object} BlogStandaloneIndexItem
 * @property {'standalone'} type
 * @property {string} entrySlug
 * @property {BlogPostIndexItem} post
 * @property {boolean} [pinned]
 */

/**
 * @typedef {BlogSeriesIndexItem | BlogStandaloneIndexItem} BlogIndexItem
 */

export { parseFrontmatter }

/**
 * @param {BlogDoc} doc
 * @returns {BlogPostIndexItem}
 */
function toIndexPost(doc) {
  const title = doc.frontmatter.title ?? humanizeSlug(doc.postSlug)
  const description = doc.frontmatter.description ?? ''
  const dateISO = doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? ''
  const tags = doc.frontmatter.tags ?? []
  const category = doc.frontmatter.category ?? ''
  return {
    entrySlug: doc.entrySlug,
    postSlug: doc.postSlug,
    title,
    description,
    dateISO,
    tags,
    category,
    path: doc.path,
  }
}

/**
 * @param {Map<string, BlogDoc>} docByKey
 * @param {string} entrySlug
 * @param {string} postSlug
 * @returns {BlogDoc | null}
 */
function findDoc(docByKey, entrySlug, postSlug) {
  return docByKey.get(`${entrySlug}/${postSlug}`) ?? null
}

/**
 * Load markdown from `src/content/blog/`, then filter and order using `blog.manifest.js`.
 *
 * @returns {{ items: readonly BlogIndexItem[], docs: readonly BlogDoc[], posts: readonly BlogPostIndexItem[] }}
 */
export function loadBlogContent() {
  /** @type {Record<string, string>} */
  const modules = import.meta.glob('/src/content/blog/**/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  })

  /** @type {BlogDoc[]} */
  const allDocs = Object.entries(modules)
    .map(([path, markdown]) => {
      const normalized = path.replaceAll('\\', '/')
      const rel = normalized.split('/src/content/blog/')[1] ?? ''
      const parts = rel.split('/').filter((p) => p.length > 0)

      let entrySlug = ''
      let postSlug = ''
      if (parts.length === 1) {
        entrySlug = parts[0].replace(/\.md$/, '')
        postSlug = entrySlug
      } else {
        entrySlug = parts[0]
        postSlug = (parts[1] ?? '').replace(/\.md$/, '')
      }

      const { frontmatter, body } = parseFrontmatter(markdown)
      return { entrySlug, postSlug, path: normalized, frontmatter, markdown: body }
    })
    .filter((d) => d.entrySlug.length > 0 && d.postSlug.length > 0)

  /** @type {Map<string, BlogDoc>} */
  const docByKey = new Map()
  for (const doc of allDocs) {
    docByKey.set(`${doc.entrySlug}/${doc.postSlug}`, doc)
  }

  /** @type {BlogDoc[]} */
  const publishedDocs = []
  /** @type {BlogIndexItem[]} */
  const items = []

  for (const entrySlug of BLOG_MANIFEST.standalone) {
    if (entrySlug.length === 0) continue
    const doc = findDoc(docByKey, entrySlug, entrySlug)
    if (!doc) continue

    publishedDocs.push(doc)
    items.push({ type: 'standalone', entrySlug, post: toIndexPost(doc) })
  }

  for (const [entrySlug, postSlugs] of Object.entries(BLOG_MANIFEST.series)) {
    if (entrySlug.length === 0) continue

    /** @type {BlogPostIndexItem[]} */
    const posts = []
    for (const postSlug of postSlugs) {
      if (postSlug.length === 0) continue
      const doc = findDoc(docByKey, entrySlug, postSlug)
      if (!doc) continue

      publishedDocs.push(doc)
      posts.push(toIndexPost(doc))
    }

    if (posts.length === 0) continue

    items.push({
      type: 'series',
      entrySlug,
      title: humanizeSlug(entrySlug),
      tags: dedupeTags(posts.flatMap((p) => p.tags)),
      posts,
    })
  }

  const pinnedSlugs = BLOG_MANIFEST.pinned ?? []
  const pinnedItems = applyBlogPinning(items, pinnedSlugs)

  /** @type {BlogPostIndexItem[]} */
  const flatPosts = []
  for (const item of pinnedItems) {
    if (item.type === 'standalone') flatPosts.push(item.post)
    else flatPosts.push(...item.posts)
  }

  return { items: pinnedItems, docs: publishedDocs, posts: flatPosts }
}

/**
 * Render markdown into sanitized HTML.
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  return DOMPurify.sanitize(renderMarkdownHtml(markdown))
}

/**
 * @param {string} slug
 * @returns {string}
 */
function humanizeSlug(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * @param {readonly string[]} tags
 * @returns {readonly string[]}
 */
function dedupeTags(tags) {
  const set = new Set(tags.filter((t) => t.length > 0))
  return Array.from(set)
}

/**
 * Resolve a markdown doc by entry + optional post slug.
 *
 * @param {readonly BlogDoc[]} docs
 * @param {string} entrySlug
 * @param {string} postSlug
 * @returns {BlogDoc | null}
 */
export function resolveDoc(docs, entrySlug, postSlug) {
  if (entrySlug.length === 0) return null
  const filtered = docs.filter((d) => d.entrySlug === entrySlug)
  if (filtered.length === 0) return null

  const isStandalone = filtered.length === 1 && filtered[0].postSlug === entrySlug
  if (isStandalone) return filtered[0]

  if (postSlug.length > 0) {
    return filtered.find((d) => d.postSlug === postSlug) ?? null
  }

  return filtered
    .slice()
    .sort((a, b) =>
      (a.frontmatter.publishedAt ?? a.frontmatter.date ?? '').localeCompare(
        b.frontmatter.publishedAt ?? b.frontmatter.date ?? '',
      ),
    )[0] ?? null
}

export { filterPostsByTag, tagHref } from './tags'
