/** Dark colour scheme. @type {'dark'} */
export const THEME_DARK = 'dark'

/** Light colour scheme. @type {'light'} */
export const THEME_LIGHT = 'light'

/** Scheme used before a visitor picks one. @type {string} */
export const THEME_DEFAULT = THEME_DARK

/** localStorage key holding the visitor's choice. @type {string} */
export const THEME_STORAGE_KEY = 'theme'

/** Class toggled on `<html>` for the dark scheme. @type {string} */
export const THEME_DARK_CLASS = 'dark'

/** Accessible label for the toggle when it will switch to light. @type {string} */
export const THEME_TO_LIGHT_LABEL = 'Switch to light theme'

/** Accessible label for the toggle when it will switch to dark. @type {string} */
export const THEME_TO_DARK_LABEL = 'Switch to dark theme'

/**
 * Inline script that applies the stored scheme before first paint,
 * so the page never flashes the wrong background.
 * @type {string}
 */
export const THEME_BOOTSTRAP_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${THEME_DEFAULT}';if(t==='${THEME_DARK}')document.documentElement.classList.add('${THEME_DARK_CLASS}')}catch(e){document.documentElement.classList.add('${THEME_DARK_CLASS}')}`
