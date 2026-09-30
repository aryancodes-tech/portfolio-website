/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'

/** @typedef {import('../../blog/toc').NumberedTocItem} NumberedTocItem */

/** Pixels from viewport top used to pick the active section. */
const ACTIVE_OFFSET = 140

/**
 * @param {readonly NumberedTocItem[]} items
 * @returns {string}
 */
function resolveActiveHeading(items) {
  if (items.length === 0) return ''

  let activeId = items[0].id
  for (const item of items) {
    const el = document.getElementById(item.id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
      activeId = item.id
    }
  }
  return activeId
}

/**
 * Sticky table of contents with scroll-spy, numbering, and auto-scroll.
 *
 * @param {object} props
 * @param {readonly NumberedTocItem[]} props.items Parsed heading anchors.
 * @param {React.RefObject<HTMLElement | null>} [props.scrollContainerRef] Scrollable sidebar container.
 */
const BlogTableOfContents = ({ items, scrollContainerRef }) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const listRef = useRef(null)
  const isFirstScroll = useRef(true)

  useEffect(() => {
    if (items.length === 0) return undefined

    const onScroll = () => {
      setActiveId(resolveActiveHeading(items))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  useEffect(() => {
    if (activeId.length === 0 || !listRef.current) return

    const activeLink = listRef.current.querySelector(`[data-toc-id="${activeId}"]`)
    if (!(activeLink instanceof HTMLElement)) return

    const scrollRoot = scrollContainerRef?.current ?? activeLink.parentElement
    if (!scrollRoot) return

    const rootRect = scrollRoot.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const behavior = isFirstScroll.current ? 'auto' : 'smooth'
    isFirstScroll.current = false

    if (linkRect.top < rootRect.top + 12) {
      scrollRoot.scrollBy({ top: linkRect.top - rootRect.top - 16, behavior })
      return
    }

    if (linkRect.bottom > rootRect.bottom - 12) {
      scrollRoot.scrollBy({ top: linkRect.bottom - rootRect.bottom + 16, behavior })
    }
  }, [activeId, scrollContainerRef])

  if (items.length === 0) return null

  return (
    <nav className="blog-toc" aria-label="Table of contents">
      <p className="blog-toc-label">On this page</p>
      <ol className="blog-toc-list" ref={listRef}>
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li
              key={item.id}
              data-toc-id={item.id}
              className={[
                'blog-toc-item',
                item.level === 3 ? 'blog-toc-depth-2' : '',
                item.level === 4 ? 'blog-toc-depth-3' : '',
                isActive ? 'blog-toc-active' : '',
              ]
                .filter((c) => c.length > 0)
                .join(' ')}
            >
              <a href={`#${item.id}`} className="blog-toc-link" aria-current={isActive ? 'location' : undefined}>
                <span className="blog-toc-number">{item.number}</span>
                <span className="blog-toc-text">{item.text}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default BlogTableOfContents
