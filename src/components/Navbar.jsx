import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { BLOG_PATH, HOME_PATH } from '../constants/urls'
import { useBlogNavAutoHide, useIsBlogReaderRoute } from '../hooks/useBlogNavAutoHide'

/** Primary in-page nav targets (crawlable hash links). */
const NAV_LINKS = [
  { href: '#education', label: 'Education' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: BLOG_PATH, label: 'Blog', isRoute: true },
  { href: '#contactme', label: 'Contact', isCta: true },
]

const linkClass =
  'font-mono text-[11px] tracking-[0.12em] uppercase text-[hsl(var(--ink))] transition-colors hover:text-[hsl(var(--signal-deep))]'

const contactCtaClass =
  'inline-block rounded-xl bg-[hsl(var(--ink))] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--surface))] no-underline shadow-[4px_4px_0_hsl(var(--signal))] transition-transform hover:-translate-y-0.5'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMenuClick = () => {
    setIsOpen((prev) => !prev)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const desktopNavLinks = NAV_LINKS.filter((link) => !link.isCta)
  const contactLink = NAV_LINKS.find((link) => link.isCta)
  const isHomeRoute = location.pathname === HOME_PATH
  const isBlogReader = useIsBlogReaderRoute()
  const navHidden = useBlogNavAutoHide(isBlogReader)

  /**
   * For hash links, ensure we always target the home route.
   * Example: from /blog, "#projects" should navigate to "/#projects".
   * @param {string} href
   * @returns {string}
   */
  const resolveHref = (href) => {
    if (href.startsWith('#')) {
      return isHomeRoute ? href : `${HOME_PATH}${href}`
    }
    return href
  }

  return (
    <header
      className={[
        'sticky top-0 z-50 px-3 pt-4 pb-2 sm:px-5',
        'transition-transform duration-300 ease-out',
        isBlogReader && navHidden ? '-translate-y-full' : 'translate-y-0',
        !isBlogReader ? 'animate-[nav-in_0.4s_ease-out]' : '',
      ]
        .filter((c) => c.length > 0)
        .join(' ')}
    >
      <div className="content flex flex-row items-center justify-between gap-4 rounded-2xl border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))]/95 px-4 py-3 shadow-[6px_6px_0_hsl(var(--signal)/0.25)] backdrop-blur-md md:px-6">
        <Link
          to={HOME_PATH}
          className="flex min-w-0 items-center gap-3 no-underline"
          aria-label="Aryan Gupta - home"
          onClick={() => {
            if (!isHomeRoute) setIsOpen(false)
          }}
        >
          <img
            src="/ag_black.svg"
            className="h-11 w-11 shrink-0 rounded-xl border-2 border-[hsl(var(--ink))] bg-[hsl(var(--paper))] p-1.5"
            alt=""
            width={44}
            height={44}
          />
          <div className="flex min-w-0 flex-col leading-none">
            <span className="font-display truncate text-lg font-bold tracking-tight text-[hsl(var(--ink))] sm:text-xl">Aryan Gupta</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))]">
              portfolio
            </span>
          </div>
        </Link>

        <div className="relative shrink-0 lg:hidden">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleMenuClick}
            className="rounded-lg border-2 border-[hsl(var(--ink))] bg-[hsl(var(--paper))] p-2 text-[hsl(var(--ink))] transition-colors hover:bg-[hsl(var(--signal)/0.12)]"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <Menu size={22} strokeWidth={2} aria-hidden />
          </button>

          {isOpen && (
            <div
              id="mobile-nav-menu"
              ref={menuRef}
              role="navigation"
              aria-label="Mobile"
              className="absolute right-0 top-full z-30 mt-2 w-[min(280px,calc(100vw-1.5rem))] origin-top-right rounded-2xl border-2 border-[hsl(var(--ink))] bg-[hsl(var(--surface))] p-4 shadow-[8px_8px_0_hsl(var(--ink)/0.12)]"
            >
              <ul className="flex flex-col gap-3 text-center">
                {NAV_LINKS.map(({ href, label, isRoute }) => (
                  <li key={href}>
                    {isRoute ? (
                      <Link to={href} className={linkClass} onClick={handleLinkClick}>
                        {label}
                      </Link>
                    ) : (
                      <a href={resolveHref(href)} className={linkClass} onClick={handleLinkClick}>
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex flex-row flex-wrap items-center gap-x-1 gap-y-2">
            {desktopNavLinks.map(({ href, label }, index) => (
              <li key={href} className="flex items-center">
                {index > 0 && (
                  <span className="px-2 font-mono text-[hsl(var(--border))]" aria-hidden>
                    ·
                  </span>
                )}
                {href.startsWith('/') ? (
                  <Link to={href} className={linkClass}>
                    {label}
                  </Link>
                ) : (
                  <a href={resolveHref(href)} className={linkClass}>
                    {label}
                  </a>
                )}
              </li>
            ))}
            {contactLink && (
              <li className="pl-6">
                <a href={resolveHref(contactLink.href)} className={contactCtaClass}>
                  {contactLink.label}
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
