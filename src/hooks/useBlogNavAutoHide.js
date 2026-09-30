import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BLOG_PATH } from '../constants/urls'

/** Minimum scroll delta before toggling nav visibility. */
const SCROLL_DELTA = 10

/** Scroll offset from top when nav is visible on blog reader pages. */
const NAV_VISIBLE_OFFSET = '7.5rem'

/** Scroll offset from top when nav is hidden on blog reader pages. */
const NAV_HIDDEN_OFFSET = '1.25rem'

/**
 * Hide the nav while scrolling up; reveal it while scrolling down on blog reader routes.
 *
 * @param {boolean} enabled Whether auto-hide behavior is active.
 * @returns {boolean} Whether the nav is currently hidden.
 */
export function useBlogNavAutoHide(enabled) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setHidden(false)
      document.documentElement.style.removeProperty('--blog-nav-offset')
      return undefined
    }

    lastScrollY.current = window.scrollY

    const applyOffset = (isHidden) => {
      document.documentElement.style.setProperty(
        '--blog-nav-offset',
        isHidden ? NAV_HIDDEN_OFFSET : NAV_VISIBLE_OFFSET,
      )
    }

    const onScroll = () => {
      const currentY = window.scrollY

      if (currentY <= 72) {
        setHidden(false)
        applyOffset(false)
        lastScrollY.current = currentY
        return
      }

      const delta = currentY - lastScrollY.current
      if (delta < -SCROLL_DELTA) {
        setHidden(true)
        applyOffset(true)
      } else if (delta > SCROLL_DELTA) {
        setHidden(false)
        applyOffset(false)
      }

      lastScrollY.current = currentY
    }

    applyOffset(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.style.removeProperty('--blog-nav-offset')
    }
  }, [enabled])

  return hidden
}

/**
 * @returns {boolean} Whether the current route is a blog reader page.
 */
export function useIsBlogReaderRoute() {
  const { pathname } = useLocation()
  return pathname.startsWith(`${BLOG_PATH}/`) && pathname.length > `${BLOG_PATH}/`.length
}
