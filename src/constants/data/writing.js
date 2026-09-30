/**
 * Sample notes. The index is not linked while SHOW_WRITING_LINK is false.
 * @type {readonly {
 *   slug: string,
 *   title: string,
 *   dateLabel: string,
 *   summary: string,
 *   paragraphs: readonly string[],
 * }[]}
 */
export const writingPosts = [
  {
    slug: 'the-part-nobody-screenshots',
    title: 'The part nobody screenshots',
    dateLabel: 'September 2026',
    summary: 'A placeholder for notes on searches, locks, and the rest of the work that never makes a thumbnail.',
    paragraphs: [
      'Most of a backend job never becomes a screenshot. A search that drops from 20 milliseconds to 5. A lock that stops two workers from taking the same picklist. An API that refuses to do the work twice.',
      'That is what I want this page to hold. This note is only the shape of it. The index is not linked from the home page yet.',
    ],
  },
]

/**
 * @param {string} slug
 * @returns {(typeof writingPosts)[number] | null}
 */
export function findWritingPost(slug) {
  if (slug.length === 0) {
    return null
  }
  const match = writingPosts.find((post) => post.slug === slug)
  return match ?? null
}
