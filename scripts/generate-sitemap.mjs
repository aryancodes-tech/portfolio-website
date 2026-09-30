#!/usr/bin/env node
/**
 * Generates public/sitemap.xml with blog posts, tag pages, lastmod, priority, and changefreq.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBlogContentFromDisk, collectTagIndex } from '../src/blog/loadNode.js'
import { blogPostHref } from '../src/blog/paths.js'
import { SITE_URL } from '../src/constants/seo.js'
import { BLOG_PATH } from '../src/constants/urls.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'src/content/blog')

/**
 * @param {string} loc
 * @param {string} [lastmod]
 * @param {string} [changefreq]
 * @param {string} [priority]
 * @returns {string}
 */
function formatUrlEntry(loc, lastmod = '', changefreq = 'monthly', priority = '0.7') {
  const lines = ['  <url>', `    <loc>${loc}</loc>`]
  if (lastmod.length > 0) lines.push(`    <lastmod>${lastmod}</lastmod>`)
  lines.push(`    <changefreq>${changefreq}</changefreq>`)
  lines.push(`    <priority>${priority}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

const { docs, posts } = loadBlogContentFromDisk(contentRoot, { validate: false })

/** @type {{ loc: string, lastmod: string, changefreq: string, priority: string }[]} */
const entries = [
  { loc: `${SITE_URL}/`, lastmod: '', changefreq: 'weekly', priority: '1.0' },
  { loc: `${SITE_URL}${BLOG_PATH}`, lastmod: '', changefreq: 'weekly', priority: '0.9' },
  { loc: `${SITE_URL}/rss.xml`, lastmod: '', changefreq: 'daily', priority: '0.5' },
]

for (const doc of docs) {
  const lastmod = doc.frontmatter.updatedAt ?? doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? ''
  const path = blogPostHref(doc.entrySlug, doc.postSlug === doc.entrySlug ? '' : doc.postSlug)
  entries.push({
    loc: `${SITE_URL}${path}`,
    lastmod,
    changefreq: 'monthly',
    priority: doc.frontmatter.featured ? '0.85' : '0.8',
  })
}

for (const tag of collectTagIndex(posts)) {
  entries.push({
    loc: `${SITE_URL}/tags/${tag.slug}`,
    lastmod: '',
    changefreq: 'weekly',
    priority: '0.7',
  })
}

const body = entries.map((e) => formatUrlEntry(e.loc, e.lastmod, e.changefreq, e.priority)).join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), sitemap)

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
writeFileSync(join(root, 'public/robots.txt'), robots)

console.log(`Generated sitemap with ${entries.length} URLs at ${SITE_URL}/sitemap.xml`)
