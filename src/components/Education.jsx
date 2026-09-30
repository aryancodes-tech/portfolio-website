import FoldedSection from './FoldedSection'
import { educationData } from '../constants/data/education'
import { EDUCATION_TITLE } from '../constants/copy'

/**
 * @param {{ cgpa?: string, percentage?: string }} entry
 * @returns {string}
 */
function scoreLabel(entry) {
  if (typeof entry.cgpa === 'string' && entry.cgpa.length > 0) {
    return entry.cgpa
  }
  if (typeof entry.percentage === 'string' && entry.percentage.length > 0) {
    return entry.percentage
  }
  return ''
}

/** Education, closed until asked for. */
const Education = () => {
  return (
    <FoldedSection id="education" title={EDUCATION_TITLE}>
      <div className="flex flex-col gap-4">
        {educationData.map((entry) => {
          const score = scoreLabel(entry)
          return (
            <article key={`${entry.degree}-${entry.duration}`} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[14px] font-medium text-[hsl(var(--ink))]">{entry.degree}</h3>
                <p className="mt-0.5 text-[13.5px] text-[hsl(var(--muted-foreground))]">
                  {entry.institution}
                  {typeof entry.field === 'string' && entry.field.length > 0 ? ` · ${entry.field}` : ''}
                </p>
              </div>
              <p className="meta shrink-0 pt-0.5 text-right">
                {entry.duration}
                {score.length > 0 ? (
                  <>
                    <br />
                    {score}
                  </>
                ) : null}
              </p>
            </article>
          )
        })}
      </div>
    </FoldedSection>
  )
}

export default Education
