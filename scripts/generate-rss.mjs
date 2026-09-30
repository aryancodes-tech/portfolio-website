#!/usr/bin/env node
/**
 * Generates public/rss.xml from published blog posts.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBlogContentFromDisk } from '../src/blog/loadNode.js'
import { blogPostHref } from '../src/blog/paths.js'
import { PERSON_NAME, SITE_URL } from '../src/constants/seo.js'
import { BLOG_PATH } from '../src/constants/urls.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'src/content/blog')

/**
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const { docs, posts } = loadBlogContentFromDisk(contentRoot, { validate: false })

/** @type {Map<string, import('../src/blog/content.js').BlogDoc>} */
const docByPath = new Map(docs.map((d) => [d.path, d]))

const sorted = posts
  .slice()
  .sort((a, b) => (b.dateISO ?? '').localeCompare(a.dateISO ?? ''))

const items = sorted
  .map((post) => {
    const doc = docByPath.get(post.path)
    const excerpt = doc?.frontmatter.excerpt ?? post.description
    const link = `${SITE_URL}${blogPostHref(post.entrySlug, post.postSlug)}`
    const pubDate = post.dateISO.length > 0 ? new Date(post.dateISO).toUTCString() : new Date().toUTCString()
    const author = doc?.frontmatter.author ?? PERSON_NAME

    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escapeXml(excerpt)}</description>`,
      `      <pubDate>${pubDate}</pubDate>`,
      `      <author>${escapeXml(author)}</author>`,
      '    </item>',
    ].join('\n')
  })
  .join('\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Engineering Blog | Aryan Gupta</title>
    <link>${SITE_URL}${BLOG_PATH}</link>
    <description>Technical articles on backends, caching, distributed systems, and production engineering.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

writeFileSync(join(root, 'public/rss.xml'), rss)
console.log(`Generated RSS feed with ${sorted.length} item(s) at ${SITE_URL}/rss.xml`)
