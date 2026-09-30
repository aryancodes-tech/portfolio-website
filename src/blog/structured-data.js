import {
  OG_IMAGE_URL,
  PERSON_NAME,
  SITE_PATH,
  SITE_URL,
} from '../constants/seo.js'
import { BLOG_PATH } from '../constants/urls.js'
import { blogPostHref } from './paths.js'
import { tagToSlug } from './frontmatter.js'

/**
 * @typedef {import('./content').BlogDoc} BlogDoc
 */

/**
 * @typedef {object} FaqItem
 * @property {string} question
 * @property {string} answer
 */

/**
 * @param {string} markdown
 * @returns {readonly FaqItem[]}
 */
export function extractFaqFromMarkdown(markdown) {
  /** @type {FaqItem[]} */
  const items = []
  const blocks = markdown.split(/\*\*Q:\s*/).slice(1)

  for (const block of blocks) {
    const answerSplit = block.split(/\nA:\s*/)
    if (answerSplit.length < 2) continue
    const question = answerSplit[0].replace(/\*\*/g, '').trim()
    const answer = answerSplit
      .slice(1)
      .join('\nA: ')
      .split(/\*\*Q:/)[0]
      .split(/\n---\n/)[0]
      .replace(/\{[^}]+\}/g, '')
      .trim()
    if (question.length > 0 && answer.length > 0) {
      items.push({ question, answer })
    }
  }

  return items
}

/**
 * @param {BlogDoc} doc
 * @param {string} canonicalUrl
 * @param {string} [ogImage]
 * @returns {object}
 */
export function buildBlogPostingSchema(doc, canonicalUrl, ogImage = OG_IMAGE_URL) {
  const title = doc.frontmatter.title ?? ''
  const description = doc.frontmatter.description ?? ''
  const datePublished = doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? ''
  const dateModified = doc.frontmatter.updatedAt ?? datePublished
  const tags = doc.frontmatter.tags ?? []
  const authorName = doc.frontmatter.author ?? PERSON_NAME

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: datePublished.length > 0 ? datePublished : undefined,
    dateModified: dateModified.length > 0 ? dateModified : undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${SITE_URL}${SITE_PATH}`,
    },
    publisher: {
      '@type': 'Person',
      name: PERSON_NAME,
      url: `${SITE_URL}${SITE_PATH}`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    inLanguage: 'en-IN',
    image: ogImage,
    keywords: tags.length > 0 ? tags.join(', ') : undefined,
    articleSection: doc.frontmatter.category?.length > 0 ? doc.frontmatter.category : undefined,
  }
}

/**
 * @param {BlogDoc} doc
 * @param {string} canonicalUrl
 * @param {string} [ogImage]
 * @returns {object}
 */
export function buildArticleSchema(doc, canonicalUrl, ogImage = OG_IMAGE_URL) {
  const posting = buildBlogPostingSchema(doc, canonicalUrl, ogImage)
  return {
    ...posting,
    '@type': 'Article',
  }
}

/**
 * @param {BlogDoc} doc
 * @param {string} canonicalUrl
 * @returns {object}
 */
export function buildBreadcrumbSchema(doc, canonicalUrl) {
  const title = doc.frontmatter.title ?? ''
  const crumbs = [
    { name: 'Home', item: `${SITE_URL}${SITE_PATH}` },
    { name: 'Blog', item: `${SITE_URL}${BLOG_PATH}` },
  ]

  if (doc.frontmatter.category?.length > 0) {
    const categorySlug = tagToSlug(doc.frontmatter.category)
    crumbs.push({
      name: doc.frontmatter.category,
      item: `${SITE_URL}/tags/${categorySlug}`,
    })
  }

  crumbs.push({ name: title, item: canonicalUrl })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  }
}

/**
 * @param {readonly FaqItem[]} faqs
 * @returns {object | null}
 */
export function buildFaqSchema(faqs) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Build all JSON-LD graphs for a blog post.
 *
 * @param {BlogDoc} doc
 * @param {string} canonicalUrl
 * @param {string} [ogImage]
 * @returns {readonly object[]}
 */
export function buildPostStructuredData(doc, canonicalUrl, ogImage = OG_IMAGE_URL) {
  const faqs = extractFaqFromMarkdown(doc.markdown)
  const schemas = [
    buildBlogPostingSchema(doc, canonicalUrl, ogImage),
    buildArticleSchema(doc, canonicalUrl, ogImage),
    buildBreadcrumbSchema(doc, canonicalUrl),
  ]

  const faqSchema = buildFaqSchema(faqs)
  if (faqSchema) schemas.push(faqSchema)

  return schemas
}

/**
 * @param {string} tagLabel
 * @param {string} tagUrl
 * @returns {object}
 */
export function buildTagBreadcrumbSchema(tagLabel, tagUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}${SITE_PATH}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}${BLOG_PATH}` },
      { '@type': 'ListItem', position: 3, name: tagLabel, item: tagUrl },
    ],
  }
}

/**
 * @param {string} entrySlug
 * @param {string} postSlug
 * @returns {string}
 */
export function postCanonicalUrl(entrySlug, postSlug) {
  return `${SITE_URL}${blogPostHref(entrySlug, postSlug)}`
}
