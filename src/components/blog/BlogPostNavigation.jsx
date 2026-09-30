/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { blogPostHref } from '../../blog/paths'
import { BLOG_NAV_NEXT_LABEL, BLOG_NAV_PREV_LABEL } from '../../constants/copy'

/** @typedef {import('../../blog/content').BlogPostIndexItem} BlogPostIndexItem */

/**
 * @param {BlogPostIndexItem} post
 * @returns {string}
 */
function postTo(post) {
  return blogPostHref(post.entrySlug, post.postSlug === post.entrySlug ? '' : post.postSlug)
}

/**
 * Chronological previous/next post navigation.
 *
 * @param {object} props
 * @param {BlogPostIndexItem | null} props.previous
 * @param {BlogPostIndexItem | null} props.next
 */
const BlogPostNavigation = ({ previous, next }) => {
  if (!previous && !next) return null

  return (
    <nav className="blog-post-nav" aria-label="Post navigation">
      {previous ? (
        <Link to={postTo(previous)} rel="prev" className="blog-post-nav-link blog-post-nav-prev">
          <span className="blog-post-nav-kicker">{BLOG_NAV_PREV_LABEL}</span>
          <span className="blog-post-nav-title">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={postTo(next)} rel="next" className="blog-post-nav-link blog-post-nav-next">
          <span className="blog-post-nav-kicker">{BLOG_NAV_NEXT_LABEL}</span>
          <span className="blog-post-nav-title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export default BlogPostNavigation
