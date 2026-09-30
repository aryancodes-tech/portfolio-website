import { ChevronDown, ArrowUpRight } from 'lucide-react'
import SectionLabel from './SectionLabel'
import TechChip from './TechChip'
import { groupExperiencesByCompany } from '../constants/data/experience'
import { formatRoleRange } from '../constants/data/tenure'
import { ROLE_KIND_LABELS } from '../constants/roles'
import { WORK_TITLE } from '../constants/copy'

/**
 * Work history grouped by employer. Each role row collapses to a title, dates,
 * and employment type; the chevron opens the write-up and the tools used.
 */
const Experience = () => {
  const groups = groupExperiencesByCompany()

  return (
    <section id="work" className="rule pad py-10" aria-labelledby="work-heading">
      <SectionLabel id="work-heading">{WORK_TITLE}</SectionLabel>

      <div className="mt-6 flex flex-col gap-7">
        {groups.map((group) => (
          <article key={group.company}>
            <div className="flex items-center gap-2.5">
              <picture>
                <source srcSet={group.logoWebp} type="image/webp" />
                <img
                  src={group.logoFallback}
                  alt=""
                  width={26}
                  height={26}
                  loading="lazy"
                  decoding="async"
                  className="h-7 w-7 rounded-md bg-white object-contain p-0.5 ring-1 ring-[hsl(var(--border))]"
                />
              </picture>
              <a
                href={group.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-display text-[15px] font-semibold tracking-tight text-[hsl(var(--ink))] no-underline"
              >
                {group.company}
                <ArrowUpRight
                  size={13}
                  strokeWidth={2}
                  className="text-[hsl(var(--faint))] transition-colors group-hover:text-[hsl(var(--ink))]"
                  aria-hidden
                />
              </a>
            </div>

            <div className="mt-1 border-l border-[hsl(var(--hairline))] pl-4 sm:ml-[12px]">
              {group.roles.map((role) => (
                <details key={role.id} className="disclosure group">
                  <summary className="summary-reset cursor-pointer py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-medium text-[hsl(var(--ink))]">{role.position}</h3>
                        <p className="meta mt-0.5">
                          {ROLE_KIND_LABELS[role.kind]}
                          {role.focus.length > 0 ? ` · ${role.focus}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pt-0.5">
                        <span className="meta hidden sm:inline">{formatRoleRange(role.start, role.until)}</span>
                        <ChevronDown
                          size={14}
                          strokeWidth={2}
                          className="disclosure-chevron text-[hsl(var(--faint))]"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <p className="meta mt-1 sm:hidden">{formatRoleRange(role.start, role.until)}</p>
                  </summary>

                  <div className="pb-4">
                    {role.description}
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${role.position} tools`}>
                      {role.techStack.map((tool) => (
                        <li key={tool}>
                          <TechChip name={tool} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Experience
