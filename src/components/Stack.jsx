import SectionLabel from './SectionLabel'
import TechChip from './TechChip'
import { stackGroups } from '../constants/data/stack'
import { STACK_TITLE } from '../constants/copy'

/** Numbered tool categories, one row each. */
const Stack = () => {
  return (
    <section id="stack" className="rule pad py-10" aria-labelledby="stack-heading">
      <SectionLabel id="stack-heading">{STACK_TITLE}</SectionLabel>

      <div className="mt-5">
        {stackGroups.map((group) => (
          <div
            key={group.index}
            className="grid grid-cols-1 gap-2 border-b border-[hsl(var(--hairline))] py-3.5 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:items-start sm:gap-4"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11px] tabular-nums text-[hsl(var(--faint))]">{group.index}</span>
              <h3 className="text-[13.5px] font-medium text-[hsl(var(--ink))]">{group.label}</h3>
            </div>
            <ul className="flex flex-wrap gap-1.5" aria-label={group.label}>
              {group.items.map((item) => (
                <li key={item}>
                  <TechChip name={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stack
