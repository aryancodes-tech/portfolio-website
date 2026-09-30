import { Moon, Sun } from 'lucide-react'
import { THEME_TO_DARK_LABEL, THEME_TO_LIGHT_LABEL } from '../constants/theme'
import { useTheme } from '../hooks/useTheme'

/** Icon-only light/dark switch for the header. */
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? THEME_TO_LIGHT_LABEL : THEME_TO_DARK_LABEL

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--ink))]"
    >
      {isDark ? <Sun size={15} strokeWidth={1.75} aria-hidden /> : <Moon size={15} strokeWidth={1.75} aria-hidden />}
    </button>
  )
}

export default ThemeToggle
