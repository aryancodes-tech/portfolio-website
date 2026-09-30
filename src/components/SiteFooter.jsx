import CopyToClipboardButton from './CopyToClipboardButton'
import { CONTACT_EMAIL, PERSON_NAME } from '../constants/seo'
import { VISITOR_ARIA_LABEL, VISITOR_ORDINAL_SUFFIXES, VISITOR_PREFIX, VISITOR_SUFFIX } from '../constants/copy'
import { useVisitorCount } from '../hooks/useVisitorCount'

/**
 * English ordinal for a positive integer, e.g. 1 -> 1st, 12 -> 12th, 23 -> 23rd.
 * @param {number} value
 * @returns {string}
 */
function ordinal(value) {
  const lastTwo = value % 100
  if (lastTwo >= 11 && lastTwo <= 13) {
    return VISITOR_ORDINAL_SUFFIXES[0]
  }
  return VISITOR_ORDINAL_SUFFIXES[value % 10] ?? VISITOR_ORDINAL_SUFFIXES[0]
}

/** Email, and a quiet visitor line. The line is omitted when the count cannot be read. */
const SiteFooter = () => {
  const count = useVisitorCount()
  const year = new Date().getFullYear()

  return (
    <footer className="rule pad py-10">
      <div className="flex flex-wrap items-center gap-1.5">
        <a href={`mailto:${CONTACT_EMAIL}`} className="link-inline font-mono text-[12px]">
          {CONTACT_EMAIL}
        </a>
        <CopyToClipboardButton content={CONTACT_EMAIL} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="meta">
          © {year} {PERSON_NAME}
        </p>
        {count !== null && (
          <p className="meta" aria-label={VISITOR_ARIA_LABEL}>
            {VISITOR_PREFIX}{' '}
            <span className="text-[hsl(var(--muted-foreground))]">
              {count.toLocaleString('en-IN')}
              <sup>{ordinal(count)}</sup>
            </span>{' '}
            {VISITOR_SUFFIX}
          </p>
        )}
      </div>
    </footer>
  )
}

export default SiteFooter
