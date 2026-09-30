/* eslint-disable react/prop-types */
import Navbar from './Navbar'

/**
 * Lined column the rest of the page sits inside.
 * Left and right rules are the frame; horizontal rules come from each section.
 * @param {{ children: import('react').ReactNode }} props
 */
const SiteFrame = ({ children }) => {
  return (
    <div className="site-shell">
      <div className="page-rail">
        <Navbar />
        {children}
      </div>
    </div>
  )
}

export default SiteFrame
