import { lazy, Suspense, useMemo } from 'react'
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import BlogFeaturedPost from '../components/blog/BlogFeaturedPost'
import BlogLatestPosts from '../components/blog/BlogLatestPosts'
import { loadBlogContent } from '../blog/content'
import { getFeaturedPost, getLatestPosts } from '../blog/navigation'

const Education = lazy(() => import("../components/Education"))
const Experience = lazy(() => import("../components/Experience"))
const Projects = lazy(() => import("../components/Projects"))
const HonorsAndAwards = lazy(() => import("../components/HonorsAndAwards"))
const PositionsOfResponsibility = lazy(() => import("../components/PositionsOfResponsibility"))
const ContactMe = lazy(() => import("../components/ContactMe"))
const ResumeButton = lazy(() => import("../components/ResumeButton"))

/** Lightweight placeholder while below-fold sections load. */
const SectionFallback = () => (
  <div className="w-full px-1 py-12 sm:px-2" aria-hidden>
    <div className="surface-card mx-auto h-48 max-w-6xl animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
  </div>
)

const Home = () => {
  const { docs, posts } = useMemo(() => loadBlogContent(), [])
  const latestPosts = useMemo(() => getLatestPosts(posts, 3), [posts])
  const featuredPost = useMemo(() => getFeaturedPost(docs, posts), [docs, posts])
  const hasBlogPosts = posts.length > 0

  return (
    <main
      className="content site-shell pb-16"
      role="main"
      aria-label="Aryan Gupta - Backend Developer, Software Engineer, Golang developer portfolio"
    >
      <Navbar />
      <HeroSection />

      {hasBlogPosts && (
        <section className="px-1 pt-6 sm:px-2" aria-label="Latest from the blog">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="surface-card rounded-[2rem] border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))] p-6 sm:p-8">
              <BlogFeaturedPost post={featuredPost} />
            </div>
            <div className="surface-card rounded-[2rem] border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))] p-6 sm:p-8">
              <BlogLatestPosts posts={latestPosts} compact />
            </div>
          </div>
        </section>
      )}

      <Suspense fallback={<SectionFallback />}>
        <Education />
        <Experience />
        <Projects />
        <HonorsAndAwards />
        <PositionsOfResponsibility />
        <ContactMe />
        <ResumeButton />
      </Suspense>
    </main>
  )
}

export default Home
