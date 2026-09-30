/* eslint-disable react/prop-types */
import { ChevronDown } from 'lucide-react'

/**
 * A section whose body stays closed until the label is clicked.
 * @param {{ id: string, title: string, children: import('react').ReactNode }} props
 */
const FoldedSection = ({ id, title, children }) => {
  return (
    <section id={id} className="rule pad" aria-labelledby={`${id}-heading`}>
      <details className="disclosure">
        <summary className="summary-reset flex cursor-pointer items-center justify-between gap-4 py-4">
          <h2
            id={`${id}-heading`}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--faint))]"
          >
            {title}
          </h2>
          <ChevronDown size={14} strokeWidth={2} className="disclosure-chevron text-[hsl(var(--faint))]" aria-hidden />
        </summary>
        <div className="pb-8">{children}</div>
      </details>
    </section>
  )
}

export default FoldedSection
