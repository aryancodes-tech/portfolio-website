/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { blogPostHref } from '../../blog/paths'
import { BLOG_RELATED_TITLE } from '../../constants/copy'

/** @typedef {import('../../blog/content').BlogPostIndexItem} BlogPostIndexItem */

/**
 * Related article recommendations.
 *
 * @param {object} props
 * @param {readonly BlogPostIndexItem[]} props.posts
 */
const BlogRelatedPosts = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <section className="blog-related" aria-label="Related articles">
      <h2 className="blog-related-title">{BLOG_RELATED_TITLE}</h2>
      <ul className="blog-related-list">
        {posts.map((post) => (
          <li key={post.path}>
            <Link
              to={blogPostHref(
                post.entrySlug,
                post.postSlug === post.entrySlug ? '' : post.postSlug,
              )}
              className="blog-related-link"
            >
              <span className="blog-related-link-title">{post.title}</span>
              {post.description.length > 0 && (
                <span className="blog-related-link-desc">{post.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BlogRelatedPosts
