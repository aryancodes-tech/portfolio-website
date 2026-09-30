import { useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BlogArticle from '../components/blog/BlogArticle'
import BlogNotFound from '../components/blog/BlogNotFound'
import BlogPostNavigation from '../components/blog/BlogPostNavigation'
import BlogRelatedPosts from '../components/blog/BlogRelatedPosts'
import BlogSeriesNav from '../components/blog/BlogSeriesNav'
import BlogTableOfContents from '../components/blog/BlogTableOfContents'
import { loadBlogContent } from '../blog/content'
import { getPostNavigation } from '../blog/navigation'
import { getRelatedPosts } from '../blog/related'
import { buildBlogPostSeo } from '../blog/seo'
import { getBlogReaderTitle, resolveBlogReader } from '../blog/resolveReader'
import { extractTocFromHtml } from '../blog/toc'
import { useBlogCodeCopy } from '../hooks/useBlogCodeCopy'
import { useBlogSeo } from '../hooks/useBlogSeo'

/**
 * Blog reader - `/blog/:entrySlug` and `/blog/:entrySlug/:postSlug`.
 */
const BlogReader = () => {
  const { entrySlug = '', postSlug = '' } = useParams()
  const tocScrollRef = useRef(null)
  const { items, docs, posts } = useMemo(() => loadBlogContent(), [])
  const articleRef = useRef(null)

  const resolved = useMemo(
    () => resolveBlogReader(items, docs, entrySlug, postSlug),
    [items, docs, entrySlug, postSlug],
  )

  useBlogCodeCopy(articleRef, resolved?.html ?? '')

  const seoConfig = useMemo(() => {
    if (!resolved) return null
    return buildBlogPostSeo(resolved.doc, entrySlug, resolved.doc.postSlug)
  }, [resolved, entrySlug])

  useBlogSeo(seoConfig)

  const toc = useMemo(() => {
    if (!resolved?.html) return []
    return extractTocFromHtml(resolved.html)
  }, [resolved?.html])

  const indexPost = useMemo(() => {
    if (!resolved) return null
    return posts.find((p) => p.path === resolved.doc.path) ?? null
  }, [resolved, posts])

  const relatedPosts = useMemo(() => {
    if (!indexPost) return []
    return getRelatedPosts(
      indexPost,
      posts,
      resolved?.doc.frontmatter.category ?? '',
    )
  }, [indexPost, posts, resolved])

  const navigation = useMemo(() => {
    if (!indexPost) return { previous: null, next: null }
    return getPostNavigation(indexPost, posts)
  }, [indexPost, posts])

  if (!resolved) {
    return (
      <main className="content site-shell pb-16" role="main" aria-label="Blog post not found">
        <Navbar />
        <BlogNotFound />
      </main>
    )
  }

  const { doc, html, isSeries, entry } = resolved
  const entryTitle = getBlogReaderTitle(resolved)
  const showSeriesSidebar = isSeries && entry.type === 'series'
  const showTocSidebar = !isSeries && toc.length > 0
  const hasSidebar = showSeriesSidebar || showTocSidebar

  const articleColumn = (
    <div className="min-w-0 flex flex-col gap-6">
      <BlogArticle doc={doc} html={html} articleRef={articleRef} />

      <BlogPostNavigation previous={navigation.previous} next={navigation.next} />
      <BlogRelatedPosts posts={relatedPosts} />
    </div>
  )

  return (
    <main className="content site-shell pb-16" role="main" aria-label={`${entryTitle} - blog`}>
      <Navbar />

      <section className="px-1 pt-8 sm:px-2 sm:pt-10" aria-label="Blog content">
        {hasSidebar ? (
          <div
            className={[
              'grid grid-cols-1 gap-6',
              showSeriesSidebar ? 'lg:grid-cols-[320px_1fr]' : 'lg:grid-cols-[240px_1fr]',
            ].join(' ')}
          >
            {showSeriesSidebar && (
              <BlogSeriesNav entry={entry} activePostSlug={doc.postSlug} />
            )}

            {showTocSidebar && (
              <aside className="blog-toc-aside hidden lg:block" ref={tocScrollRef}>
                <BlogTableOfContents items={toc} scrollContainerRef={tocScrollRef} />
              </aside>
            )}

            {articleColumn}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl">{articleColumn}</div>
        )}
      </section>
    </main>
  )
}

export default BlogReader
