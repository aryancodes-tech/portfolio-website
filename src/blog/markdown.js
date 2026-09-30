import { marked } from 'marked'
import { nextHeadingNumber, stripLeadingNumber } from './heading-numbers.js'
import { tagToSlug } from './frontmatter.js'

/** Whether the marked renderer has been configured. */
let configured = false

/**
 * @param {string} input
 * @returns {string}
 */
function escapeHtml(input) {
  const text = String(input ?? '')
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function extractCodeText(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'text' in value) {
    const maybeText = /** @type {{ text?: unknown }} */ (value).text
    if (typeof maybeText === 'string') return maybeText
  }
  return String(value ?? '')
}

/**
 * Add anchor ids and hierarchical numbers to H2–H4.
 *
 * @param {string} html
 * @returns {string}
 */
function addHeadingIdsAndNumbers(html) {
  /** @type {Map<string, number>} */
  const used = new Map()
  /** @type {import('./heading-numbers.js').HeadingNumberState} */
  const state = { h2: 0, h3: 0, h4: 0 }

  return html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/gi, (match, levelStr, inner) => {
    const level = Number(levelStr)
    const plainText = inner.replace(/<[^>]+>/g, '').trim()
    if (plainText.length === 0) return match

    const number = nextHeadingNumber(/** @type {2 | 3 | 4} */ (level), state)
    const label = stripLeadingNumber(plainText)
    const base = tagToSlug(label.length > 0 ? label : plainText)
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`
    const cleanedInner = inner.replace(/^(\d+(?:\.\d+)*\.?\s+)/, '')

    return [
      `<h${level} id="${id}" data-num="${number}">`,
      `<span class="blog-heading-num" aria-hidden="true">${number}</span>`,
      `<span class="blog-heading-text">${cleanedInner}</span>`,
      `</h${level}>`,
    ].join('')
  })
}

/**
 * Configure marked with GFM, heading anchor IDs, and copy-button code blocks.
 */
export function setupMarkdownRenderer() {
  if (configured) return

  marked.setOptions({
    gfm: true,
    breaks: false,
  })

  const blogRenderer = new marked.Renderer()

  /**
   * @param {string} code
   * @param {string} infostring
   * @returns {string}
   */
  blogRenderer.code = (code, infostring = '') => {
    const language = (infostring || '').trim().split(/\s+/)[0]
    const langClass = language.length > 0 ? `language-${escapeHtml(language)}` : ''
    const safeCode = escapeHtml(extractCodeText(code))

    return [
      '<div class="blog-codeblock">',
      '<button type="button" class="blog-codecopy" aria-label="Copy code">Copy</button>',
      `<pre><code class="${langClass}">${safeCode}</code></pre>`,
      '</div>',
    ].join('')
  }

  marked.use({ renderer: blogRenderer })
  configured = true
}

/**
 * Wrap GFM tables for horizontal scroll on small screens.
 * @param {string} html
 * @returns {string}
 */
export function wrapBlogTables(html) {
  return html.replace(/<table>/g, '<div class="blog-table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
}

/**
 * Render markdown to HTML (unsanitized; trusted source only).
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdownHtml(markdown) {
  setupMarkdownRenderer()
  return wrapBlogTables(addHeadingIdsAndNumbers(marked.parse(markdown)))
}
