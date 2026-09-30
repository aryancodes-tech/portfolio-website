import { numberTocItems, stripLeadingNumber } from './heading-numbers.js'

/**
 * @typedef {object} TocItem
 * @property {2 | 3 | 4} level Heading depth (H2–H4).
 * @property {string} text Visible heading label.
 * @property {string} id DOM anchor id.
 * @property {string} [number] Hierarchical section number.
 */

/**
 * @typedef {TocItem & { number: string }} NumberedTocItem
 */

/**
 * Extract plain heading label from rendered heading HTML.
 * @param {string} innerHtml
 * @returns {string}
 */
function parseHeadingLabel(innerHtml) {
  const textMatch = innerHtml.match(/<span class="blog-heading-text">([\s\S]*?)<\/span>/i)
  const raw = textMatch ? textMatch[1] : innerHtml
  return stripLeadingNumber(raw.replace(/<[^>]+>/g, '').trim())
}

/**
 * Extract table of contents entries from rendered HTML headings.
 * @param {string} html Sanitized or trusted article HTML.
 * @returns {readonly NumberedTocItem[]}
 */
export function extractTocFromHtml(html) {
  /** @type {TocItem[]} */
  const items = []
  const re = /<h([2-4])\s+id="([^"]+)"(?:\s+data-num="([^"]+)")?[^>]*>([\s\S]*?)<\/h\1>/gi
  let match = re.exec(html)

  while (match) {
    const level = Number(match[1])
    const id = match[2]
    const dataNum = match[3] ?? ''
    const label = parseHeadingLabel(match[4])

    if (label.length > 0 && id.length > 0 && (level === 2 || level === 3 || level === 4)) {
      items.push({
        level,
        text: label,
        id,
        number: dataNum,
      })
    }
    match = re.exec(html)
  }

  const needsNumbers = items.some((item) => !item.number || item.number.length === 0)
  if (needsNumbers) return numberTocItems(items)

  return items.map((item) => ({
    ...item,
    number: item.number ?? '',
  }))
}

/**
 * @param {readonly TocItem[]} items
 * @returns {boolean}
 */
export function hasTableOfContents(items) {
  return items.length > 0
}
