/* eslint-disable react/prop-types */
/**
 * Small monospaced section marker. Renders the accessible heading for a section.
 * @param {{ id: string, children: import('react').ReactNode }} props
 */
const SectionLabel = ({ id, children }) => {
  return (
    <h2
      id={id}
      className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--faint))]"
    >
      {children}
    </h2>
  )
}

export default SectionLabel
