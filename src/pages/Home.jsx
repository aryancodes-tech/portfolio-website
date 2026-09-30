import { lazy, Suspense, useEffect } from 'react'
import SiteFrame from '../components/SiteFrame'
import HeroSection from '../components/HeroSection'

const Experience = lazy(() => import('../components/Experience'))
const Stack = lazy(() => import('../components/Stack'))
const Projects = lazy(() => import('../components/Projects'))
const Education = lazy(() => import('../components/Education'))
const Achievements = lazy(() => import('../components/Achievements'))
const SiteFooter = lazy(() => import('../components/SiteFooter'))

/**
 * The work, stack, and project anchors render after a lazy chunk.
 * Scroll once they exist, including a direct visit to `/#stack`.
 */
const HashScroll = () => {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1)
      if (id.length === 0) {
        return
      }
      document.getElementById(id)?.scrollIntoView()
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return null
}

/** Lightweight placeholder while below-fold sections load. */
const SectionFallback = () => (
  <div className="pad py-10" aria-hidden>
    <div className="h-20 animate-pulse rounded-lg bg-[hsl(var(--surface))]" />
  </div>
)

const Home = () => {
  return (
    <SiteFrame>
      <main role="main" aria-label="Aryan Gupta, backend engineer">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <Experience />
          <Stack />
          <Projects />
          <Education />
          <Achievements />
          <SiteFooter />
          <HashScroll />
        </Suspense>
      </main>
    </SiteFrame>
  )
}

export default Home
