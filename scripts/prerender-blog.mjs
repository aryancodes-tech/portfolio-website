#!/usr/bin/env node
/**
 * Prerenders blog, tag, and post routes as static HTML in dist/ for crawler-visible content.
 * Runs after `vite build`; static files take precedence over SPA rewrites on Vercel.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildStaticPage,
  escapeHtml,
  renderPostNavHtml,
  renderRelatedHtml,
  renderTocHtml,
} from './blog-html.mjs'
import { loadBlogContentFromDisk, collectTagIndex } from '../src/blog/loadNode.js'
import { renderMarkdownHtml } from '../src/blog/markdown.js'
import { buildBlogIndexMetadata, buildBlogPostMetadata, buildTagPageMetadata } from '../src/blog/metadata.js'
import { getPostNavigation } from '../src/blog/navigation.js'
import { getRelatedPosts } from '../src/blog/related.js'
import { extractTocFromHtml } from '../src/blog/toc.js'
import { filterPostsByTag } from '../src/blog/tags.js'
import { BLOG_PATH } from '../src/constants/urls.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'src/content/blog')
const distDir = join(root, 'dist')
const indexHtmlPath = join(distDir, 'index.html')

if (!existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found — run vite build before prerender.')
  process.exit(1)
}

/**
 * @param {string} html
 * @returns {string}
 */
function extractStylesheetHref(html) {
  const match = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)
  return match?.[1] ?? '/assets/index.css'
}

const distIndex = readFileSync(indexHtmlPath, 'utf8')
const stylesheetHref = extractStylesheetHref(distIndex)

const { docs, posts, items } = loadBlogContentFromDisk(contentRoot, { validate: false })

/**
 * @param {string} relativePath
 * @param {string} html
 */
function writePrerenderedPage(relativePath, html) {
  const outPath = join(distDir, relativePath, 'index.html')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
}

// Blog index
const blogIndexMeta = buildBlogIndexMetadata()
const blogListItems = posts
  .map((post) => {
    const href = `/blog/${post.entrySlug}${post.postSlug !== post.entrySlug ? `/${post.postSlug}` : ''}`
    return `<li><article><h2><a href="${href}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p><time datetime="${escapeHtml(post.dateISO)}">${escapeHtml(post.dateISO)}</time></article></li>`
  })
  .join('\n')

writePrerenderedPage(
  'blog',
  buildStaticPage({
    meta: blogIndexMeta,
    bodyHtml: `<section aria-label="Blog index"><h1>Engineering Blog</h1><ul>${blogListItems}</ul></section>`,
    stylesheetHref,
  }),
)

// Individual posts
for (const doc of docs) {
  const html = renderMarkdownHtml(doc.markdown)
  const toc = extractTocFromHtml(html)
  const indexPost = posts.find((p) => p.path === doc.path)
  if (!indexPost) continue

  const meta = buildBlogPostMetadata(doc, doc.entrySlug, doc.postSlug)
  const related = getRelatedPosts(indexPost, posts, doc.frontmatter.category ?? '')
  const navigation = getPostNavigation(indexPost, posts)

  const articleHtml = [
    `<article class="blog-prose-static">`,
    `<header><h1>${escapeHtml(doc.frontmatter.title ?? '')}</h1>`,
    doc.frontmatter.description?.length > 0
      ? `<p class="lead">${escapeHtml(doc.frontmatter.description)}</p>`
      : '',
    `<time datetime="${escapeHtml(doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? '')}">${escapeHtml(doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? '')}</time>`,
    `</header>`,
    renderTocHtml(toc),
    html,
    `</article>`,
    renderPostNavHtml(navigation),
    renderRelatedHtml(related),
  ].join('\n')

  const route =
    doc.entrySlug === doc.postSlug
      ? `blog/${doc.entrySlug}`
      : `blog/${doc.entrySlug}/${doc.postSlug}`

  writePrerenderedPage(
    route,
    buildStaticPage({ meta, bodyHtml: articleHtml, stylesheetHref }),
  )
}

// Tag pages
const tags = collectTagIndex(posts)
for (const tag of tags) {
  const tagged = filterPostsByTag(posts, tag.slug)
  const meta = buildTagPageMetadata(tag.label, tag.slug)

  const list = tagged
    .map((post) => {
      const href = `/blog/${post.entrySlug}${post.postSlug !== post.entrySlug ? `/${post.postSlug}` : ''}`
      return `<li><a href="${href}">${escapeHtml(post.title)}</a></li>`
    })
    .join('\n')

  writePrerenderedPage(
    `tags/${tag.slug}`,
    buildStaticPage({
      meta,
      bodyHtml: `<section aria-label="Tag archive"><h1>${escapeHtml(tag.label)}</h1><p>Articles tagged ${escapeHtml(tag.label)}.</p><ul>${list}</ul><p><a href="${BLOG_PATH}">← Back to blog</a></p></section>`,
      stylesheetHref,
    }),
  )
}

console.log(`Prerendered blog index, ${docs.length} post(s), and ${tags.length} tag page(s).`)
