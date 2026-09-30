#!/usr/bin/env node
/**
 * Generates per-post Open Graph images (SVG + optional JPG via rsvg-convert).
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBlogContentFromDisk } from '../src/blog/loadNode.js'
import { PERSON_NAME } from '../src/constants/seo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'src/content/blog')
const outDir = join(root, 'public/og/blog')

mkdirSync(outDir, { recursive: true })

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
}

/**
 * @param {string} title
 * @param {number} maxLen
 * @returns {string}
 */
function truncateTitle(title, maxLen = 72) {
  if (title.length <= maxLen) return title
  return `${title.slice(0, maxLen - 1)}…`
}

/**
 * @param {string} title
 * @param {string} date
 * @returns {string}
 */
function buildOgSvg(title, date) {
  const safeTitle = escapeXml(truncateTitle(title))
  const safeDate = escapeXml(date)
  const safeAuthor = escapeXml(PERSON_NAME)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect x="48" y="48" width="1104" height="534" rx="32" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="96" y="140" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" letter-spacing="0.2em">ARYANCODES.TECH</text>
  <text x="96" y="280" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="52" font-weight="700">${safeTitle}</text>
  <text x="96" y="520" fill="#cbd5e1" font-family="ui-monospace, monospace" font-size="26">${safeDate} · ${safeAuthor}</text>
</svg>`
}

let hasRsvg = false
try {
  execSync('which rsvg-convert', { stdio: 'ignore' })
  hasRsvg = true
} catch {
  console.warn('rsvg-convert not found; OG images will be SVG only (install: brew install librsvg)')
}

const { docs } = loadBlogContentFromDisk(contentRoot, { validate: false })

for (const doc of docs) {
  const slug = doc.frontmatter.slug?.length > 0 ? doc.frontmatter.slug : doc.postSlug
  const title = doc.frontmatter.title ?? slug
  const date = doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? ''
  const svgPath = join(outDir, `${slug}.svg`)
  const jpgPath = join(outDir, `${slug}.jpg`)

  writeFileSync(svgPath, buildOgSvg(title, date))

  if (hasRsvg) {
    try {
      execSync(`rsvg-convert -w 1200 -h 630 "${svgPath}" -o "${jpgPath}"`)
    } catch {
      console.warn(`Failed to convert OG image for ${slug}`)
    }
  }

  if (!existsSync(jpgPath)) {
    const defaultOg = join(root, 'public/og-image.jpg')
    if (existsSync(defaultOg)) copyFileSync(defaultOg, jpgPath)
  }
}

console.log(`Generated ${docs.length} blog OG image(s) in public/og/blog/`)
