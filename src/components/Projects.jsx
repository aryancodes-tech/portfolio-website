import { ArrowUpRight } from 'lucide-react'
import SectionLabel from './SectionLabel'
import { projectsData } from '../constants/data/projects'
import { GITHUB_LINK_LABEL, PROJECT_LIVE_LABEL, PROJECTS_INTRO, PROJECTS_TITLE } from '../constants/copy'

/** Project cards with covers. Sits after work and stack on purpose. */
const Projects = () => {
  return (
    <section id="projects" className="rule pad py-10" aria-labelledby="projects-heading">
      <SectionLabel id="projects-heading">{PROJECTS_TITLE}</SectionLabel>
      <p className="mt-4 text-[13.5px] text-[hsl(var(--muted-foreground))]">{PROJECTS_INTRO}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projectsData.map((project) => (
          <article key={project.name} className="surface-card group">
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline"
            >
              <img
                src={project.image}
                alt=""
                width={640}
                height={400}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </a>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[15px] font-semibold tracking-tight text-[hsl(var(--ink))]">
                  <a
                    href={project.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[hsl(var(--ink))] no-underline"
                  >
                    {project.name}
                    <ArrowUpRight size={13} strokeWidth={2} className="text-[hsl(var(--faint))] group-hover:text-[hsl(var(--ink))]" aria-hidden />
                  </a>
                </h3>
                <span className="chip shrink-0">{PROJECT_LIVE_LABEL}</span>
              </div>
              <p className="mt-2 text-[13.5px] text-[hsl(var(--muted-foreground))]">{project.description}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
                <span className="text-[hsl(var(--faint))]">{project.note}</span>
                {project.githubLink.length > 0 && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-quiet"
                  >
                    {GITHUB_LINK_LABEL}
                  </a>
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects
