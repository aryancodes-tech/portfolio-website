import { useCallback, useEffect, useState } from 'react'
import {
  THEME_DARK,
  THEME_DARK_CLASS,
  THEME_DEFAULT,
  THEME_LIGHT,
  THEME_STORAGE_KEY,
} from '../constants/theme'

/**
 * Reads the scheme the bootstrap script already applied, so the first
 * render agrees with the painted background.
 * @returns {string}
 */
function currentTheme() {
  if (document.documentElement.classList.contains(THEME_DARK_CLASS)) {
    return THEME_DARK
  }
  return THEME_LIGHT
}

/**
 * Stores the choice. A blocked or full quota must not stop the visual switch.
 * @param {string} theme
 */
function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Unable to persist theme preference:', error)
  }
}

/**
 * Colour scheme state, persisted to localStorage.
 * @returns {{ theme: string, isDark: boolean, toggleTheme: () => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(THEME_DEFAULT)

  useEffect(() => {
    setTheme(currentTheme())
  }, [])

  const toggleTheme = useCallback(() => {
    const next = currentTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK
    document.documentElement.classList.toggle(THEME_DARK_CLASS, next === THEME_DARK)
    persistTheme(next)
    setTheme(next)
  }, [])

  return { theme, isDark: theme === THEME_DARK, toggleTheme }
}
