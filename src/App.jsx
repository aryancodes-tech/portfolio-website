import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './App.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Writing, { WritingPost } from './pages/Writing'
import { DSA_EXTERNAL_URL, RESUME_DRIVE_URL, WRITING_PATH } from './constants/urls'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<RedirectToResume />} />
          <Route path="/dsa" element={<RedirectToDsa />} />
          <Route path={WRITING_PATH} element={<Writing />} />
          <Route path={`${WRITING_PATH}/:slug`} element={<WritingPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  )
}

export default App
