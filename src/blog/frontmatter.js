import { PERSON_NAME } from '../constants/seo.js'

/**
 * @typedef {object} BlogFrontmatter
 * @property {string} title Post title.
 * @property {string} description Meta description (150–160 chars recommended).
 * @property {string} excerpt Short summary for RSS/cards.
 * @property {string} slug URL slug override.
 * @property {string} publishedAt ISO publish date.
 * @property {string} updatedAt ISO last-updated date.
 * @property {string} author Author display name.
 * @property {readonly string[]} tags Topic tags.
 * @property {string} category Primary category.
 * @property {string} coverImage Absolute or site-relative cover image URL.
 * @property {boolean} featured Whether post is featured on homepage/blog index.
 * @property {boolean} draft Unpublished draft flag.
 * @property {string} [date] Legacy alias for publishedAt.
 */

/** @type {readonly string[]} */
export const REQUIRED_PUBLISHED_FIELDS = ['title', 'description', 'publishedAt', 'author', 'tags']

/**
 * @param {string} value
 * @returns {string}
 */
export function stripQuotes(value) {
  const v = value.trim()
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    return v.slice(1, -1)
  }
  return v
}

/**
 * Parse tags formatted as `[a, b, c]`.
 * @param {string} value
 * @returns {readonly string[]}
 */
export function parseTags(value) {
  const v = value.trim()
  if (!v.startsWith('[') || !v.endsWith(']')) return []
  const inner = v.slice(1, -1).trim()
  if (inner.length === 0) return []
  return inner.split(',').map((t) => stripQuotes(t.trim())).filter((t) => t.length > 0)
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function parseBoolean(value) {
  const v = stripQuotes(value).toLowerCase()
  return v === 'true' || v === 'yes' || v === '1'
}

/**
 * Parse YAML-like frontmatter block from markdown.
 * @param {string} raw Full markdown file contents.
 * @returns {{ frontmatter: BlogFrontmatter, body: string }}
 */
export function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return { frontmatter: {}, body: raw }
  const end = raw.indexOf('\n---\n', 4)
  if (end === -1) return { frontmatter: {}, body: raw }

  const fmText = raw.slice(4, end).trim()
  const body = raw.slice(end + '\n---\n'.length)

  /** @type {Record<string, string>} */
  const rawFields = {}
  for (const line of fmText.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    const idx = trimmed.indexOf(':')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    rawFields[key] = value
  }

  const publishedAt = stripQuotes(rawFields.publishedAt ?? rawFields.date ?? '')
  const updatedAt = stripQuotes(rawFields.updatedAt ?? publishedAt)

  /** @type {BlogFrontmatter} */
  const frontmatter = {
    title: stripQuotes(rawFields.title ?? ''),
    description: stripQuotes(rawFields.description ?? ''),
    excerpt: stripQuotes(rawFields.excerpt ?? rawFields.description ?? ''),
    slug: stripQuotes(rawFields.slug ?? ''),
    publishedAt,
    updatedAt,
    author: stripQuotes(rawFields.author ?? PERSON_NAME),
    tags: rawFields.tags ? parseTags(rawFields.tags) : [],
    category: stripQuotes(rawFields.category ?? ''),
    coverImage: stripQuotes(rawFields.coverImage ?? ''),
    featured: rawFields.featured ? parseBoolean(rawFields.featured) : false,
    draft: rawFields.draft ? parseBoolean(rawFields.draft) : false,
    date: publishedAt,
  }

  return { frontmatter, body }
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function formatValidationPath(filePath) {
  return filePath.replace(/\\/g, '/').split('/src/content/blog/')[1] ?? filePath
}

/**
 * Validate frontmatter for a published manifest entry. Throws on failure.
 * @param {BlogFrontmatter} frontmatter
 * @param {string} filePath
 */
export function validatePublishedFrontmatter(frontmatter, filePath) {
  const rel = formatValidationPath(filePath)
  const errors = []

  if (frontmatter.draft) {
    errors.push('draft:true posts cannot be published in blog.manifest.js')
  }

  if (frontmatter.title.length < 10) {
    errors.push('title must be at least 10 characters')
  }

  if (frontmatter.description.length < 50) {
    errors.push('description must be at least 50 characters')
  }

  if (frontmatter.description.length > 320) {
    errors.push('description must be at most 320 characters')
  }

  if (frontmatter.publishedAt.length === 0) {
    errors.push('publishedAt (or date) is required')
  }

  if (frontmatter.author.length === 0) {
    errors.push('author is required')
  }

  if (!frontmatter.tags || frontmatter.tags.length === 0) {
    errors.push('at least one tag is required')
  }

  if (errors.length > 0) {
    throw new Error(`Invalid blog frontmatter in ${rel}:\n- ${errors.join('\n- ')}`)
  }
}

/**
 * @param {string} tag
 * @returns {string}
 */
export function tagToSlug(tag) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function slugToLabel(slug) {
  return slug
    .split('-')
    .filter((p) => p.length > 0)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}
