/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { blogPostHref } from '../../blog/paths'
import { BLOG_LATEST_TITLE } from '../../constants/copy'

/** @typedef {import('../../blog/content').BlogPostIndexItem} BlogPostIndexItem */

/**
 * Latest articles list for blog index or homepage.
 *
 * @param {object} props
 * @param {readonly BlogPostIndexItem[]} props.posts
 * @param {boolean} [props.compact]
 */
const BlogLatestPosts = ({ posts, compact = false }) => {
  if (!posts || posts.length === 0) return null

  return (
    <section className={compact ? 'blog-latest blog-latest-compact' : 'blog-latest'} aria-label="Latest articles">
      <h2 className="blog-latest-title">{BLOG_LATEST_TITLE}</h2>
      <ul className="blog-latest-list">
        {posts.map((post) => (
          <li key={post.path}>
            <Link
              to={blogPostHref(post.entrySlug, post.postSlug === post.entrySlug ? '' : post.postSlug)}
              className="blog-latest-link"
            >
              <span className="blog-latest-link-title">{post.title}</span>
              {!compact && post.description.length > 0 && (
                <span className="blog-latest-link-desc">{post.description}</span>
              )}
              {post.dateISO.length > 0 && (
                <time className="blog-latest-date" dateTime={post.dateISO}>
                  {post.dateISO}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BlogLatestPosts
