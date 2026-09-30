import {
  META_DESCRIPTION,
  META_TITLE,
  OG_DESCRIPTION,
  OG_IMAGE_URL,
  OG_SITE_NAME,
  OG_TITLE,
  SITE_PATH,
  SITE_URL,
} from '../constants/seo'
import {
  buildBlogIndexMetadata,
  buildBlogPostMetadata,
  buildTagPageMetadata,
} from './metadata'

/**
 * @typedef {import('./metadata').PageMetadata} PageSeoConfig
 */

/** @type {string} */
const BLOG_JSON_LD_PREFIX = 'blog-jsonld-'

/**
 * @param {string} name
 * @returns {HTMLMetaElement}
 */
function getOrCreateMetaByName(name) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  return el
}

/**
 * @param {string} property
 * @returns {HTMLMetaElement}
 */
function getOrCreateMetaByProperty(property) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  return el
}

/**
 * @returns {HTMLLinkElement}
 */
function getOrCreateCanonicalLink() {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  return el
}

/**
 * @param {string} id
 * @param {object} data
 */
function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Remove all blog JSON-LD script tags.
 */
function removeBlogJsonLd() {
  document.querySelectorAll(`script[id^="${BLOG_JSON_LD_PREFIX}"]`).forEach((el) => el.remove())
}

/**
 * @typedef {import('./content').BlogDoc} BlogDoc
 */

/**
 * Build SEO config for the blog index page.
 * @returns {PageSeoConfig}
 */
export function buildBlogIndexSeo() {
  return buildBlogIndexMetadata()
}

/**
 * Build SEO config for a published blog post.
 *
 * @param {BlogDoc} doc Resolved markdown document.
 * @param {string} entrySlug Route entry slug.
 * @param {string} postSlug Route post slug.
 * @returns {PageSeoConfig}
 */
export function buildBlogPostSeo(doc, entrySlug, postSlug) {
  return buildBlogPostMetadata(doc, entrySlug, postSlug)
}

/**
 * Build SEO config for a tag archive page.
 *
 * @param {string} tagLabel
 * @param {string} tagSlug
 * @returns {PageSeoConfig}
 */
export function buildTagPageSeo(tagLabel, tagSlug) {
  return buildTagPageMetadata(tagLabel, tagSlug)
}

/**
 * Apply per-route SEO tags for blog pages.
 *
 * @param {PageSeoConfig} config
 */
export function applyPageSeo(config) {
  document.title = config.title

  getOrCreateMetaByName('description').setAttribute('content', config.description)
  getOrCreateMetaByName('robots').setAttribute('content', config.robots)

  getOrCreateMetaByProperty('og:title').setAttribute('content', config.title)
  getOrCreateMetaByProperty('og:description').setAttribute('content', config.description)
  getOrCreateMetaByProperty('og:url').setAttribute('content', config.canonicalUrl)
  getOrCreateMetaByProperty('og:type').setAttribute('content', config.ogType)
  getOrCreateMetaByProperty('og:site_name').setAttribute('content', OG_SITE_NAME)
  getOrCreateMetaByProperty('og:image').setAttribute('content', config.ogImage)

  getOrCreateMetaByName('twitter:card').setAttribute('content', 'summary_large_image')
  getOrCreateMetaByName('twitter:title').setAttribute('content', config.title)
  getOrCreateMetaByName('twitter:description').setAttribute('content', config.description)
  getOrCreateMetaByName('twitter:image').setAttribute('content', config.ogImage)

  getOrCreateCanonicalLink().setAttribute('href', config.canonicalUrl)

  removeBlogJsonLd()
  config.jsonLd.forEach((schema, index) => {
    setJsonLd(`${BLOG_JSON_LD_PREFIX}${index}`, schema)
  })
}

/**
 * Restore homepage SEO defaults when leaving blog routes.
 */
export function restoreDefaultPageSeo() {
  const canonicalUrl = `${SITE_URL}${SITE_PATH}`

  document.title = META_TITLE
  getOrCreateMetaByName('description').setAttribute('content', META_DESCRIPTION)
  getOrCreateMetaByName('robots').setAttribute('content', 'index, follow, max-image-preview:large')
  getOrCreateMetaByProperty('og:title').setAttribute('content', OG_TITLE)
  getOrCreateMetaByProperty('og:description').setAttribute('content', OG_DESCRIPTION)
  getOrCreateMetaByProperty('og:url').setAttribute('content', canonicalUrl)
  getOrCreateMetaByProperty('og:type').setAttribute('content', 'profile')
  getOrCreateMetaByProperty('og:image').setAttribute('content', OG_IMAGE_URL)
  getOrCreateMetaByName('twitter:title').setAttribute('content', OG_TITLE)
  getOrCreateMetaByName('twitter:description').setAttribute('content', OG_DESCRIPTION)
  getOrCreateMetaByName('twitter:image').setAttribute('content', OG_IMAGE_URL)
  getOrCreateCanonicalLink().setAttribute('href', canonicalUrl)
  removeBlogJsonLd()
}

// Re-export for consumers that still import schema builders.
export { buildBlogPostingSchema, buildPostStructuredData } from './structured-data'
