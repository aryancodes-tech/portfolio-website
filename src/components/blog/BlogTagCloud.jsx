/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { tagHref } from '../../blog/tags'
import { BLOG_TAGS_TITLE } from '../../constants/copy'

/**
 * @typedef {object} TagIndexItem
 * @property {string} slug
 * @property {string} label
 * @property {number} count
 */

/**
 * Popular tags cloud for internal linking.
 *
 * @param {object} props
 * @param {readonly TagIndexItem[]} props.tags
 */
const BlogTagCloud = ({ tags }) => {
  if (!tags || tags.length === 0) return null

  return (
    <section className="blog-tag-cloud" aria-label="Popular tags">
      <h2 className="blog-tag-cloud-title">{BLOG_TAGS_TITLE}</h2>
      <ul className="blog-tag-cloud-list">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link to={tagHref(tag.slug)} className="chip-tech blog-tag-cloud-chip">
              {tag.label}
              <span className="blog-tag-count" aria-label={`${tag.count} articles`}>
                {tag.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BlogTagCloud
