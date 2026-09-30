/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import SiteButton from '../SiteButton'
import { tagHref, tagToSlug } from '../../blog/tags'
import { BLOG_READER_BACK_LABEL } from '../../constants/copy'
import { BLOG_PATH } from '../../constants/urls'

/** @typedef {import('../../blog/content').BlogDoc} BlogDoc */

/**
 * Rendered blog post body with header metadata.
 *
 * @param {object} props
 * @param {BlogDoc} props.doc Resolved markdown document.
 * @param {string} props.html Sanitized HTML from {@link renderMarkdown}.
 * @param {React.RefObject<HTMLElement | null>} props.articleRef Root element for code-copy delegation.
 */
const BlogArticle = ({ doc, html, articleRef }) => {
  const publishedAt = doc.frontmatter.publishedAt ?? doc.frontmatter.date ?? ''
  const category = doc.frontmatter.category ?? ''

  return (
    <article
      className="surface-card min-w-0 overflow-hidden rounded-[2rem] border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))] p-7 sm:p-10"
      aria-label={doc.frontmatter.title ?? 'Blog post'}
      ref={articleRef}
    >
      <div className="flex items-center justify-between gap-3 pb-4">
        <SiteButton variant="secondary" size="compact" to={BLOG_PATH}>
          {BLOG_READER_BACK_LABEL}
        </SiteButton>
        {publishedAt.length > 0 && (
          <time
            className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))]"
            dateTime={publishedAt}
          >
            {publishedAt}
          </time>
        )}
      </div>

      <div className="flex flex-col gap-3 border-b-2 border-dashed border-[hsl(var(--border))] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ink))] sm:text-4xl">
          {doc.frontmatter.title ?? ''}
        </h1>
        {doc.frontmatter.description && doc.frontmatter.description.length > 0 && (
          <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
            {doc.frontmatter.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {category.length > 0 && (
            <Link to={tagHref(tagToSlug(category))} className="chip-tech">
              {category}
            </Link>
          )}
          {doc.frontmatter.tags && doc.frontmatter.tags.length > 0 &&
            doc.frontmatter.tags.map((tag) => (
              <Link key={tag} to={tagHref(tagToSlug(tag))} className="chip-tech">
                {tag}
              </Link>
            ))}
        </div>
      </div>

      <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  )
}

export default BlogArticle
