import FoldedSection from './FoldedSection'
import { awardsData } from '../constants/data/honors'
import { positionsData } from '../constants/data/positions'
import { ACHIEVEMENTS_TITLE } from '../constants/copy'

/** Awards and campus roles, closed until asked for. */
const Achievements = () => {
  return (
    <FoldedSection id="achievements" title={ACHIEVEMENTS_TITLE}>
      <div className="flex flex-col gap-4">
        {awardsData.map((award) => (
          <article key={award.title}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[14px] font-medium text-[hsl(var(--ink))]">{award.title}</h3>
              <p className="meta shrink-0">{award.organization}</p>
            </div>
            <div className="mt-1 text-[13.5px] text-[hsl(var(--muted-foreground))]">{award.description}</div>
          </article>
        ))}
        {positionsData.map((position) => (
          <article key={`${position.role}-${position.organization}`}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[14px] font-medium text-[hsl(var(--ink))]">
                {position.role}
                <span className="ml-2 text-[13.5px] font-normal text-[hsl(var(--muted-foreground))]">
                  {position.organization}
                </span>
              </h3>
              <p className="meta shrink-0">{position.duration}</p>
            </div>
            <div className="mt-1 text-[13.5px] text-[hsl(var(--muted-foreground))]">{position.description}</div>
          </article>
        ))}
      </div>
    </FoldedSection>
  )
}

export default Achievements
