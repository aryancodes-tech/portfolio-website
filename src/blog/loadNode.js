import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BLOG_MANIFEST } from '../constants/blog.manifest.js'
import { applyBlogPinning } from './applyPinning.js'
import { parseFrontmatter, tagToSlug, validatePublishedFrontmatter } from './frontmatter.js'

/**
 * @typedef {import('./content').BlogDoc} BlogDoc
 * @typedef {import('./content').BlogIndexItem} BlogIndexItem
 * @typedef {import('./content').BlogPostIndexItem} BlogPostIndexItem
 */

/**
 * @param {string} contentRoot Absolute path to `src/content/blog`.
 * @returns {readonly BlogDoc[]}
 */
function readAllMarkdownDocs(contentRoot) {
  /** @type {BlogDoc[]} */
  const docs = []

  /**
   * @param {string} dir
   * @param {string} [entrySlug]
   */
  function walk(dir, entrySlug = '') {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (name.endsWith('.md')) {
        const raw = readFileSync(full, 'utf8')
        const { frontmatter, body } = parseFrontmatter(raw)
        const postSlug = name.replace(/\.md$/, '')
        const resolvedEntry = entrySlug.length > 0 ? entrySlug : postSlug
        const resolvedPost = entrySlug.length > 0 ? postSlug : postSlug

        docs.push({
          entrySlug: resolvedEntry,
          postSlug: resolvedPost,
          path: full,
          frontmatter,
          markdown: body,
        })
        continue
      }

      const child = join(dir, name)
      try {
        if (readdirSync(child)) walk(child, name)
      } catch {
        // not a directory
      }
    }
  }

  walk(contentRoot)
  return docs
}

/**
 * @param {BlogDoc} doc
 * @returns {BlogPostIndexItem}
 */
function toIndexPost(doc) {
  const title = doc.frontmatter.title ?? doc.postSlug
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
 * Load published blog content from the filesystem (Node/build scripts).
 *
 * @param {string} contentRoot Absolute path to `src/content/blog`.
 * @param {{ validate?: boolean }} [options]
 * @returns {{ items: readonly BlogIndexItem[], docs: readonly BlogDoc[], posts: readonly BlogPostIndexItem[] }}
 */
export function loadBlogContentFromDisk(contentRoot, options = {}) {
  const shouldValidate = options.validate !== false
  const allDocs = readAllMarkdownDocs(contentRoot)

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
    if (shouldValidate) validatePublishedFrontmatter(doc.frontmatter, doc.path)

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
      if (shouldValidate) validatePublishedFrontmatter(doc.frontmatter, doc.path)

      publishedDocs.push(doc)
      posts.push(toIndexPost(doc))
    }

    if (posts.length === 0) continue
    const tags = [...new Set(posts.flatMap((p) => p.tags).filter((t) => t.length > 0))]
    items.push({ type: 'series', entrySlug, title: entrySlug, tags, posts })
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
 * Collect unique tag slugs across published posts.
 *
 * @param {readonly BlogPostIndexItem[]} posts
 * @returns {readonly { slug: string, label: string, count: number }[]}
 */
export function collectTagIndex(posts) {
  /** @type {Map<string, { label: string, count: number }>} */
  const map = new Map()

  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (tag.length === 0) continue
      const slug = tagToSlug(tag)
      const existing = map.get(slug)
      if (existing) {
        existing.count += 1
      } else {
        map.set(slug, { label: tag, count: 1 })
      }
    }
  }

  return [...map.entries()]
    .map(([slug, meta]) => ({ slug, label: meta.label, count: meta.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
