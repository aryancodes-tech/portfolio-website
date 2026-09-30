#!/usr/bin/env node
/**
 * Validates published blog frontmatter. Fails the build on invalid SEO metadata.
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBlogContentFromDisk } from '../src/blog/loadNode.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = join(root, 'src/content/blog')

try {
  const { docs, posts } = loadBlogContentFromDisk(contentRoot, { validate: true })
  console.log(`Validated ${docs.length} published post(s), ${posts.length} index row(s).`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
