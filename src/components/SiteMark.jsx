/* eslint-disable react/prop-types */
/**
 * Three nodes on a path — the route an order takes. Inherits the text colour,
 * so the same glyph works in both themes. Shares its shape with /mark.svg.
 * @param {{ size?: number }} props
 */
const SiteMark = ({ size = 18 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M10.6 21.2 15.4 10.4M17.4 10.6 21.6 17.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9.8" cy="22.6" r="2.4" fill="currentColor" />
      <circle cx="16.4" cy="8.8" r="2.4" fill="currentColor" />
      <circle cx="22.4" cy="18.6" r="2.4" fill="currentColor" />
    </svg>
  )
}

export default SiteMark
