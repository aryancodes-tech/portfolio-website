import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SiteMark from './SiteMark'
import { SHOW_WRITING_LINK } from '../constants/features'
import { PERSON_NAME } from '../constants/seo'
import { HOME_PATH, RESUME_PATH, WRITING_PATH } from '../constants/urls'
import {
  MENU_CLOSE_LABEL,
  MENU_LABEL,
  PROJECTS_HREF,
  PROJECTS_NAV_LABEL,
  RESUME_LABEL,
  STACK_HREF,
  STACK_NAV_LABEL,
  WORK_HREF,
  WORK_NAV_LABEL,
  WRITING_NAV_LABEL,
} from '../constants/copy'

/** In-page links. Notes is included only while {@link SHOW_WRITING_LINK} is true. */
const NAV_LINKS = [
  { href: WORK_HREF, label: WORK_NAV_LABEL },
  { href: STACK_HREF, label: STACK_NAV_LABEL },
  { href: PROJECTS_HREF, label: PROJECTS_NAV_LABEL },
  ...(SHOW_WRITING_LINK ? [{ href: WRITING_PATH, label: WRITING_NAV_LABEL }] : []),
  { href: RESUME_PATH, label: RESUME_LABEL },
]

const linkClass = 'link-quiet text-[13px]'

/** Slim sticky header: mark on the left, section links and the theme switch on the right. */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--hairline))] bg-[hsl(var(--paper)/0.86)] backdrop-blur-md">
      <div className="pad flex h-14 items-center justify-between gap-4">
        <a
          href={HOME_PATH}
          className="flex items-center gap-2 text-[hsl(var(--ink))] no-underline"
          aria-label={`${PERSON_NAME} — home`}
        >
          <SiteMark />
          <span className="font-display text-[14px] font-semibold tracking-tight">{PERSON_NAME}</span>
        </a>

        <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))]"
            aria-expanded={isOpen}
            aria-controls="site-menu"
            aria-label={isOpen ? MENU_CLOSE_LABEL : MENU_LABEL}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X size={16} strokeWidth={1.75} aria-hidden /> : <Menu size={16} strokeWidth={1.75} aria-hidden />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          id="site-menu"
          className="pad flex flex-col gap-3 border-t border-[hsl(var(--hairline))] py-4 sm:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={linkClass} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navbar
