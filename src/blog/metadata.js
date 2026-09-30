import {
  BLOG_INDEX_META_DESCRIPTION,
  BLOG_INDEX_META_TITLE,
  BLOG_POST_TITLE_SUFFIX,
} from '../constants/copy.js'
import {
  OG_IMAGE_URL,
  SITE_URL,
} from '../constants/seo.js'
import { BLOG_PATH } from '../constants/urls.js'
import { blogPostHref } from './paths.js'
import { buildPostStructuredData, buildTagBreadcrumbSchema } from './structured-data.js'

/**
 * @typedef {import('./content').BlogDoc} BlogDoc
 */

/**
 * @typedef {object} PageMetadata
 * @property {string} title Document title.
 * @property {string} description Meta description.
 * @property {string} canonicalUrl Absolute canonical URL.
 * @property {string} robots Robots directive.
 * @property {'website' | 'article' | 'profile'} ogType Open Graph type.
 * @property {string} ogImage Absolute OG image URL.
 * @property {string} ogImageAlt OG image alt text.
 * @property {readonly object[]} jsonLd JSON-LD schema objects.
 */

/**
 * @param {string} slug
 * @returns {string}
 */
export function blogOgImageUrl(slug) {
  if (slug.length === 0) return OG_IMAGE_URL
  return `${SITE_URL}/og/blog/${slug}.jpg`
}

/**
 * Build metadata for the blog index.
 * @returns {PageMetadata}
 */
export function buildBlogIndexMetadata() {
  return {
    title: BLOG_INDEX_META_TITLE,
    description: BLOG_INDEX_META_DESCRIPTION,
    canonicalUrl: `${SITE_URL}${BLOG_PATH}`,
    robots: 'index, follow, max-image-preview:large',
    ogType: 'website',
    ogImage: OG_IMAGE_URL,
    ogImageAlt: 'Aryan Gupta Engineering Blog',
    jsonLd: [],
  }
}

/**
 * Build metadata for a published blog post.
 *
 * @param {BlogDoc} doc
 * @param {string} entrySlug Route entry slug.
 * @param {string} postSlug Route post slug.
 * @returns {PageMetadata}
 */
export function buildBlogPostMetadata(doc, entrySlug, postSlug) {
  const title = doc.frontmatter.title ?? ''
  const description = doc.frontmatter.description ?? ''
  const isStandalone = entrySlug === postSlug
  const path = blogPostHref(entrySlug, isStandalone ? '' : postSlug)
  const canonicalUrl = `${SITE_URL}${path}`
  const imageSlug = doc.frontmatter.slug?.length > 0 ? doc.frontmatter.slug : postSlug
  const coverImage = doc.frontmatter.coverImage ?? ''
  const ogImage = coverImage.length > 0 ? coverImage : blogOgImageUrl(imageSlug)

  return {
    title: title.length > 0 ? `${title}${BLOG_POST_TITLE_SUFFIX}` : BLOG_INDEX_META_TITLE,
    description: description.length > 0 ? description : BLOG_INDEX_META_DESCRIPTION,
    canonicalUrl,
    robots: 'index, follow, max-image-preview:large',
    ogType: 'article',
    ogImage,
    ogImageAlt: title.length > 0 ? title : 'Aryan Gupta Engineering Blog',
    jsonLd: buildPostStructuredData(doc, canonicalUrl, ogImage),
  }
}

/**
 * Build metadata for a tag archive page.
 *
 * @param {string} tagLabel Human-readable tag label.
 * @param {string} tagSlug URL slug.
 * @returns {PageMetadata}
 */
export function buildTagPageMetadata(tagLabel, tagSlug) {
  const canonicalUrl = `${SITE_URL}/tags/${tagSlug}`
  const description = `Articles tagged ${tagLabel} on Aryan Gupta's engineering blog — backends, distributed systems, and production tradeoffs.`

  return {
    title: `${tagLabel} Articles${BLOG_POST_TITLE_SUFFIX}`,
    description,
    canonicalUrl,
    robots: 'index, follow',
    ogType: 'website',
    ogImage: OG_IMAGE_URL,
    ogImageAlt: `${tagLabel} articles — Aryan Gupta`,
    jsonLd: [buildTagBreadcrumbSchema(tagLabel, canonicalUrl)],
  }
}
