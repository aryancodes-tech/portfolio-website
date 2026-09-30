import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteFrame from '../components/SiteFrame'
import { NOT_FOUND_META_TITLE } from '../constants/seo'
import { HOME_PATH } from '../constants/urls'
import { NOT_FOUND_BODY, NOT_FOUND_HEADING, NOT_FOUND_HOME_LABEL, NOT_FOUND_KICKER } from '../constants/copy'

/** Custom 404 for unknown in-app routes. */
const NotFound = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const previousTitle = document.title
    document.title = NOT_FOUND_META_TITLE
    return () => {
      document.title = previousTitle
    }
  }, [])

  const showPath = pathname.length > 0 && pathname !== HOME_PATH

  return (
    <SiteFrame>
      <main
        className="pad flex min-h-[70vh] flex-col justify-center py-16"
        role="main"
        aria-labelledby="not-found-heading"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--faint))]">
          {NOT_FOUND_KICKER}
        </p>
        <h1
          id="not-found-heading"
          className="mt-3 font-display text-[1.65rem] font-semibold tracking-tight text-[hsl(var(--ink))]"
        >
          {NOT_FOUND_HEADING}
        </h1>
        <p className="mt-3 max-w-md text-[hsl(var(--muted-foreground))]">{NOT_FOUND_BODY}</p>
        {showPath && <p className="meta mt-3 truncate">{pathname}</p>}
        <p className="mt-7">
          <Link to={HOME_PATH} className="link-inline text-[13.5px]">
            {NOT_FOUND_HOME_LABEL}
          </Link>
        </p>
      </main>
    </SiteFrame>
  )
}

export default NotFound
