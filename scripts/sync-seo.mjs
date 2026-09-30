#!/usr/bin/env node
/**
 * Injects SEO constants and static LCP shell into index.html
 * between AUTO markers (SEO, LCP CSS, LCP HTML).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE_URL,
  SITE_PATH,
  PERSON_NAME,
  META_TITLE,
  META_DESCRIPTION,
  META_KEYWORDS,
  OG_SITE_NAME,
  OG_TITLE,
  OG_DESCRIPTION,
  OG_IMAGE_URL,
  OG_IMAGE_ALT,
  HERO_KICKER,
  HERO_SUMMARY_PLAIN,
  PROFILE_IMAGE_ALT,
  buildStructuredDataGraph,
} from '../src/constants/seo.js'
import { HERO_PHOTO_WEBP, HERO_PHOTO_WEBP_SM } from '../src/constants/assets.js'
import { THEME_BOOTSTRAP_SCRIPT } from '../src/constants/theme.js'
import { LCP_CRITICAL_CSS, buildLcpShellHtml } from './lcp-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const indexPath = join(root, 'index.html')

const canonicalUrl = `${SITE_URL}${SITE_PATH}`
const jsonLd = JSON.stringify(buildStructuredDataGraph(), null, 2)
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')

const headBlock = `    <script>${THEME_BOOTSTRAP_SCRIPT}</script>
    <link rel="icon" type="image/svg+xml" href="/mark.svg"/>
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${META_DESCRIPTION}" />
    <meta name="keywords" content="${META_KEYWORDS}" />
    <meta name="author" content="${PERSON_NAME}" />
    <meta name="google-site-verification" content="googleb40b905bc3926bb8.html" />
    <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:type" content="profile" />
    <meta property="profile:username" content="aryancodes-tech" />
    <meta property="og:title" content="${OG_TITLE}" />
    <meta property="og:description" content="${OG_DESCRIPTION}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="${OG_SITE_NAME}" />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:image:secure_url" content="${OG_IMAGE_URL}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${OG_IMAGE_ALT}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@aryancodes_tech" />
    <meta name="twitter:title" content="${OG_TITLE}" />
    <meta name="twitter:description" content="${OG_DESCRIPTION}" />
    <meta name="twitter:image" content="${OG_IMAGE_URL}" />
    <meta name="twitter:image:alt" content="${OG_IMAGE_ALT}" />
    <meta name="twitter:creator" content="@aryancodes_tech" />
    <link rel="image_src" href="${OG_IMAGE_URL}" />
    <link rel="preload" href="${HERO_PHOTO_WEBP_SM}" as="image" type="image/webp" fetchpriority="high" />
    <title>${META_TITLE}</title>
    <script type="application/ld+json">
${jsonLd}
    </script>`

const lcpCssBlock = `    <style id="lcp-critical">\n${LCP_CRITICAL_CSS}\n    </style>`

const lcpHtmlBlock = buildLcpShellHtml({
  kicker: HERO_KICKER,
  name: PERSON_NAME,
  summary: HERO_SUMMARY_PLAIN,
  imageAlt: PROFILE_IMAGE_ALT,
  imageSm: HERO_PHOTO_WEBP_SM,
  imageLg: HERO_PHOTO_WEBP,
})

/**
 * @param {string} html
 * @param {string} startMarker
 * @param {string} endMarker
 * @param {string} block
 * @returns {string}
 */
function replaceBlock(html, startMarker, endMarker, block) {
  const startIdx = html.indexOf(startMarker)
  const endIdx = html.indexOf(endMarker)
  if (startIdx === -1 || endIdx === -1) {
    console.error(`Missing ${startMarker} or ${endMarker} in index.html`)
    process.exit(1)
  }
  return (
    html.slice(0, startIdx + startMarker.length) +
    '\n' +
    block +
    '\n    ' +
    html.slice(endIdx)
  )
}

let html = readFileSync(indexPath, 'utf8')
html = replaceBlock(html, '<!-- SEO:AUTO_START -->', '<!-- SEO:AUTO_END -->', headBlock)
html = replaceBlock(html, '<!-- LCP_CSS:AUTO_START -->', '<!-- LCP_CSS:AUTO_END -->', lcpCssBlock)
html = replaceBlock(html, '<!-- LCP:AUTO_START -->', '<!-- LCP:AUTO_END -->', lcpHtmlBlock)

writeFileSync(indexPath, html)
console.log('Synced SEO meta, LCP shell, and JSON-LD to index.html')
