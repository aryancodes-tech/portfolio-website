import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteFrame from '../components/SiteFrame'
import SectionLabel from '../components/SectionLabel'
import { WRITING_BACK_LABEL, WRITING_INTRO, WRITING_META_TITLE, WRITING_TITLE } from '../constants/copy'
import { findWritingPost, writingPosts } from '../constants/data/writing'
import { useNoIndex } from '../hooks/useNoIndex'
import { WRITING_PATH } from '../constants/urls'
import { PERSON_NAME } from '../constants/seo'
import NotFound from './NotFound'

/** Unlisted notes index. */
const Writing = () => {
  useNoIndex()
  useEffect(() => {
    document.title = WRITING_META_TITLE
  }, [])

  return (
    <SiteFrame>
      <main className="pad pb-20 pt-10" role="main" aria-labelledby="writing-heading">
        <SectionLabel id="writing-heading">{WRITING_TITLE}</SectionLabel>
        <p className="mt-4 text-[hsl(var(--muted-foreground))]">{WRITING_INTRO}</p>

        <div className="mt-6">
          {writingPosts.map((post) => (
            <article
              key={post.slug}
              className="group border-t border-[hsl(var(--hairline))] py-4 last:border-b last:border-[hsl(var(--hairline))]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[14px] font-medium">
                  <Link to={`${WRITING_PATH}/${post.slug}`} className="text-[hsl(var(--ink))] no-underline">
                    {post.title}
                  </Link>
                </h3>
                <p className="meta shrink-0">{post.dateLabel}</p>
              </div>
              <p className="mt-1 text-[13.5px] text-[hsl(var(--muted-foreground))]">{post.summary}</p>
            </article>
          ))}
        </div>
      </main>
    </SiteFrame>
  )
}

/** A single note. Unknown slugs fall through to the site 404. */
const WritingPost = () => {
  const { slug = '' } = useParams()
  const post = findWritingPost(slug)
  useNoIndex()
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ${PERSON_NAME}`
    }
  }, [post])

  if (!post) {
    return <NotFound />
  }

  return (
    <SiteFrame>
      <main className="pad pb-20 pt-10" role="main" aria-labelledby="note-heading">
        <article>
          <p className="meta">{post.dateLabel}</p>
          <h1
            id="note-heading"
            className="mt-2 font-display text-[1.65rem] font-semibold tracking-tight text-[hsl(var(--ink))]"
          >
            {post.title}
          </h1>
          <div className="mt-6 space-y-4 text-[hsl(var(--muted-foreground))]">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-10">
            <Link to={WRITING_PATH} className="meta link-quiet">
              {WRITING_BACK_LABEL}
            </Link>
          </p>
        </article>
      </main>
    </SiteFrame>
  )
}

export { WritingPost }
export default Writing
