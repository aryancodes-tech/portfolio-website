import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './App.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { DSA_EXTERNAL_URL, RESUME_DRIVE_URL } from './constants/urls'
import Blog from './pages/Blog'
import BlogReader from './pages/BlogReader'
import BlogTag from './pages/BlogTag'

/**
 * Scroll to hash target when navigating within the SPA.
 * Home sections are lazy-loaded, so we retry briefly until the element exists.
 */
function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash.length <= 1) return
    const id = hash.slice(1)

    let cancelled = false
    const startedAt = Date.now()

    const tryScroll = () => {
      if (cancelled) return

      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      if (Date.now() - startedAt > 2000) return
      window.setTimeout(tryScroll, 50)
    }

    // Slight delay lets route + suspense settle.
    window.setTimeout(tryScroll, 0)

    return () => {
      cancelled = true
    }
  }, [pathname, hash])

  return null
}

/** Sends the browser to the public resume PDF on Google Drive. */
function RedirectToResume() {
  useEffect(() => {
    if (RESUME_DRIVE_URL.length > 0) {
      window.location.href = RESUME_DRIVE_URL
    }
  }, [])
  return null
}

/** Sends the browser to the DSA site (dsa.aryancodes.tech). */
function RedirectToDsa() {
  useEffect(() => {
    if (DSA_EXTERNAL_URL.length > 0) {
      window.location.replace(DSA_EXTERNAL_URL)
    }
  }, [])
  return null
}

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:entrySlug" element={<BlogReader />} />
          <Route path="/blog/:entrySlug/:postSlug" element={<BlogReader />} />
          <Route path="/tags/:tagSlug" element={<BlogTag />} />
          <Route path="/resume" element={<RedirectToResume />} />
          <Route path="/dsa" element={<RedirectToDsa />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  )
}

export default App
