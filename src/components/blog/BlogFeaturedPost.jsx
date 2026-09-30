/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { blogPostHref } from '../../blog/paths'
import { BLOG_FEATURED_TITLE } from '../../constants/copy'

/** @typedef {import('../../blog/content').BlogPostIndexItem} BlogPostIndexItem */

/**
 * Featured article highlight for homepage or blog index.
 *
 * @param {object} props
 * @param {BlogPostIndexItem | null} props.post
 */
const BlogFeaturedPost = ({ post }) => {
  if (!post) return null

  return (
    <section className="blog-featured" aria-label="Featured article">
      <p className="blog-featured-kicker">{BLOG_FEATURED_TITLE}</p>
      <h2 className="blog-featured-title">
        <Link
          to={blogPostHref(post.entrySlug, post.postSlug === post.entrySlug ? '' : post.postSlug)}
        >
          {post.title}
        </Link>
      </h2>
      {post.description.length > 0 && (
        <p className="blog-featured-desc">{post.description}</p>
      )}
    </section>
  )
}

export default BlogFeaturedPost
