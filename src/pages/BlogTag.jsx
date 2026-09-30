import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { filterPostsByTag } from '../blog/content'
import { loadBlogContent } from '../blog/content'
import { tagToSlug } from '../blog/frontmatter'
import { buildTagPageSeo } from '../blog/seo'
import { blogPostHref } from '../blog/paths'
import { BLOG_PATH } from '../constants/urls'
import { BLOG_TAG_BACK_LABEL, BLOG_TAG_EMPTY_DESCRIPTION, BLOG_TAG_EMPTY_TITLE } from '../constants/copy'
import { useBlogSeo } from '../hooks/useBlogSeo'

/**
 * Tag archive page — `/tags/:tagSlug`.
 */
const BlogTag = () => {
  const { tagSlug = '' } = useParams()
  const { posts } = useMemo(() => loadBlogContent(), [])

  const taggedPosts = useMemo(() => filterPostsByTag(posts, tagSlug), [posts, tagSlug])

  const tagLabel = useMemo(() => {
    const first = taggedPosts[0]
    if (!first) return tagSlug.replace(/-/g, ' ')
    const match = (first.tags ?? []).find((t) => tagToSlug(t) === tagSlug)
    return match ?? tagSlug.replace(/-/g, ' ')
  }, [taggedPosts, tagSlug])

  const seoConfig = useMemo(() => buildTagPageSeo(tagLabel, tagSlug), [tagLabel, tagSlug])
  useBlogSeo(seoConfig)

  return (
    <main className="content site-shell pb-16" role="main" aria-label={`${tagLabel} articles`}>
      <Navbar />

      <section className="px-1 pt-8 sm:px-2 sm:pt-10" aria-label="Tag archive">
        <div className="surface-card overflow-hidden rounded-[2rem] border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))] p-7 sm:p-10">
          <div className="flex flex-col gap-4 border-b-2 border-dashed border-[hsl(var(--border))] pb-6">
            <Link to={BLOG_PATH} className="font-mono text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ink))]">
              {BLOG_TAG_BACK_LABEL}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ink))] sm:text-4xl">
              {tagLabel}
            </h1>
            <p className="text-base text-[hsl(var(--muted-foreground))] sm:text-lg">
              Articles tagged <strong>{tagLabel}</strong>.
            </p>
          </div>

          {taggedPosts.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="text-xl font-semibold text-[hsl(var(--ink))]">{BLOG_TAG_EMPTY_TITLE}</h2>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">{BLOG_TAG_EMPTY_DESCRIPTION}</p>
            </div>
          ) : (
            <ul className="mt-8 flex flex-col gap-4">
              {taggedPosts.map((post) => (
                <li key={post.path}>
                  <Link
                    to={blogPostHref(post.entrySlug, post.postSlug === post.entrySlug ? '' : post.postSlug)}
                    className="block rounded-xl border border-[hsl(var(--border))] p-5 transition hover:border-[hsl(var(--ink))]"
                  >
                    <h2 className="text-lg font-semibold text-[hsl(var(--ink))]">{post.title}</h2>
                    {post.description.length > 0 && (
                      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{post.description}</p>
                    )}
                    {post.dateISO.length > 0 && (
                      <time className="mt-3 block font-mono text-xs text-[hsl(var(--muted-foreground))]" dateTime={post.dateISO}>
                        {post.dateISO}
                      </time>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

export default BlogTag
