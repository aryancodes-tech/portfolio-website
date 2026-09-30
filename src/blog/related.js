/**
 * @typedef {import('./content').BlogPostIndexItem} BlogPostIndexItem
 */

/**
 * @param {string} text
 * @returns {Set<string>}
 */
function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )
}

/**
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {number}
 */
function jaccardSimilarity(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const word of a) {
    if (b.has(word)) intersection += 1
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Score relatedness between two posts.
 * @param {BlogPostIndexItem} source
 * @param {BlogPostIndexItem} candidate
 * @param {string} [sourceCategory]
 * @returns {number}
 */
function scoreRelatedness(source, candidate, sourceCategory = '') {
  if (source.path === candidate.path) return -1

  let score = 0
  const sourceTags = new Set(source.tags ?? [])
  for (const tag of candidate.tags ?? []) {
    if (sourceTags.has(tag)) score += 3
  }

  if (sourceCategory.length > 0 && candidate.category === sourceCategory) {
    score += 2
  }

  const sourceTokens = tokenize(`${source.title} ${source.description}`)
  const candidateTokens = tokenize(`${candidate.title} ${candidate.description}`)
  score += jaccardSimilarity(sourceTokens, candidateTokens) * 2

  return score
}

/**
 * Return 3–5 related posts ranked by tag/category/keyword overlap.
 *
 * @param {BlogPostIndexItem} post Active post.
 * @param {readonly BlogPostIndexItem[]} catalog All published posts.
 * @param {string} [category] Optional category from frontmatter.
 * @param {number} [limit=5]
 * @returns {readonly BlogPostIndexItem[]}
 */
export function getRelatedPosts(post, catalog, category = '', limit = 5) {
  const scored = catalog
    .map((candidate) => ({
      candidate,
      score: scoreRelatedness(post, candidate, category),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)

  const max = Math.min(Math.max(limit, 3), 5)
  return scored.slice(0, max).map((row) => row.candidate)
}
