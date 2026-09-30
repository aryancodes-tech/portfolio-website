import { OG_SITE_NAME } from '../src/constants/seo.js'

/**
 * @typedef {import('../src/blog/metadata.js').PageMetadata} PageMetadata
 */

/**
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {PageMetadata} meta
 * @returns {string}
 */
export function renderHeadTags(meta) {
  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(OG_SITE_NAME)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />`,
  ]

  for (const schema of meta.jsonLd) {
    lines.push(
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    )
  }

  return lines.join('\n    ')
}

/**
 * @param {readonly import('../src/blog/toc.js').TocItem[]} toc
 * @returns {string}
 */
export function renderTocHtml(toc) {
  if (!toc || toc.length === 0) return ''

  const items = toc
    .map((item) => {
      const indent = item.level === 3 ? 'ml-4' : item.level === 4 ? 'ml-8' : ''
      return `<li class="${indent}"><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>`
    })
    .join('\n')

  return `<nav class="blog-toc-static" aria-label="Table of contents"><h2>On this page</h2><ol>${items}</ol></nav>`
}

/**
 * @param {readonly import('../src/blog/content.js').BlogPostIndexItem[]} related
 * @returns {string}
 */
export function renderRelatedHtml(related) {
  if (!related || related.length === 0) return ''
  const items = related
    .map((post) => {
      const href = `/blog/${post.entrySlug}${post.postSlug !== post.entrySlug ? `/${post.postSlug}` : ''}`
      return `<li><a href="${href}">${escapeHtml(post.title)}</a></li>`
    })
    .join('\n')
  return `<section aria-label="Related articles"><h2>Related reading</h2><ul>${items}</ul></section>`
}

/**
 * @param {import('../src/blog/navigation.js').BlogPostNavigation} nav
 * @returns {string}
 */
export function renderPostNavHtml(nav) {
  const prev = nav.previous
    ? `<a rel="prev" href="/blog/${nav.previous.entrySlug}${nav.previous.postSlug !== nav.previous.entrySlug ? `/${nav.previous.postSlug}` : ''}">← ${escapeHtml(nav.previous.title)}</a>`
    : ''
  const next = nav.next
    ? `<a rel="next" href="/blog/${nav.next.entrySlug}${nav.next.postSlug !== nav.next.entrySlug ? `/${nav.next.postSlug}` : ''}">${escapeHtml(nav.next.title)} →</a>`
    : ''

  if (prev.length === 0 && next.length === 0) return ''
  return `<nav class="blog-post-nav-static" aria-label="Post navigation">${prev}${next}</nav>`
}

/**
 * Build a crawler-visible static HTML page.
 *
 * @param {object} options
 * @param {PageMetadata} options.meta
 * @param {string} options.bodyHtml Main article HTML.
 * @param {string} [options.stylesheetHref]
 * @param {string} [options.headerHtml]
 * @param {string} [options.footerHtml]
 * @returns {string}
 */
export function buildStaticPage({ meta, bodyHtml, stylesheetHref = '', headerHtml = '', footerHtml = '' }) {
  const cssLink = stylesheetHref.length > 0 ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}" />` : ''

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${cssLink}
    ${renderHeadTags(meta)}
  </head>
  <body>
    <main role="main">
      ${headerHtml}
      ${bodyHtml}
      ${footerHtml}
    </main>
  </body>
</html>`
}
