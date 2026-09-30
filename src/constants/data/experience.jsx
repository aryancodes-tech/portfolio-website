import { ROLE_KIND_FULL_TIME, ROLE_KIND_INTERNSHIP } from '../roles'
import {
  LOGO_BEZTLABS_JPEG,
  LOGO_BEZTLABS_WEBP,
  LOGO_OMNIFUL_PNG,
  LOGO_OMNIFUL_WEBP,
} from '../assets'

/**
 * Work history, newest first.
 *
 * `until` is the month shown on the row. Empty means Present.
 * `rangeEnd` is exclusive and is what the tenure pills count.
 * The Omniful internship hands July 2025 to the full-time role so that month is not counted twice.
 * Bezt Labs runs through December 2024, so its exclusive end is 1 January 2025.
 */
export const experiences = [
  {
    id: 'omniful-sde',
    company: 'Omniful AI',
    logoWebp: LOGO_OMNIFUL_WEBP,
    logoFallback: LOGO_OMNIFUL_PNG,
    position: 'SDE - I',
    focus: 'Warehouse Management System',
    start: '2025-07-01',
    until: '',
    rangeEnd: '',
    kind: ROLE_KIND_FULL_TIME,
    website: 'https://omniful.ai',
    description: (
      <ul className="list-disc space-y-1.5 pl-4 text-[13.5px] text-[hsl(var(--muted-foreground))] marker:text-[hsl(var(--faint))]">
        <li>Led a <b>2+ engineer backend team</b>, owning design decisions, reviewing PRs, and running KT sessions.</li>
        <li>Reduced search latency by <b>75% (20ms to 5ms)</b> utilizing <b>PostgreSQL Full-Text Search (tsvector/tsquery)</b> and advanced indexing (B-Tree, GiST, n-gram).</li>
        <li>Designed and enforced <b>multi-tenant RBAC authorization</b>, preventing cross-tenant data exposure and securing <b>450+ API endpoints</b>.</li>
        <li>Built end-to-end <b>Packaging Materials Inventory System</b>, enabling packaging material selection during packing and tracking life cycle of inventory from inwarding to order consumption.</li>
        <li>Implemented <b>Fixed-Bucket Rate Limiting</b> on 10+ public APIs, reducing abuse during traffic spikes.</li>
        <li>Architected <b>idempotent Wave & Picklist Generation Algorithms</b> ensuring exactly-once execution across distributed warehouse operations.</li>
        <li>Built a common input sanitisation library, mitigating <b>HTML & SQL injection risks</b> across multiple backend modules.</li>
        <li>Worked on <b>index and query optimizations</b> in core WMS modules including Cycle Count, Serialised SKUs, Hub/Location Based Inventory and Picklists.</li>
      </ul>
    ),
    techStack: ['Golang', 'PostgreSQL', 'AWS', 'Redis', 'Docker', 'Kafka'],
  },
  {
    id: 'omniful-intern',
    company: 'Omniful AI',
    logoWebp: LOGO_OMNIFUL_WEBP,
    logoFallback: LOGO_OMNIFUL_PNG,
    position: 'SDE Intern',
    focus: '',
    start: '2025-01-01',
    until: '2025-07-01',
    rangeEnd: '2025-07-01',
    kind: ROLE_KIND_INTERNSHIP,
    website: 'https://omniful.ai',
    description: (
      <ul className="list-disc space-y-1.5 pl-4 text-[13.5px] text-[hsl(var(--muted-foreground))] marker:text-[hsl(var(--faint))]">
        <li>Reduced API response time from <b>1,400ms to 8ms</b>, scaling the daily processing from <b>20K+ to 50K+</b> orders.</li>
        <li>Enhanced UX of <b>21,000+ entities</b> leveraging <b>Firebase Cloud Messaging</b> to improve cross-device communication.</li>
        <li>Implemented <b>Redis Locks</b> to prevent failures, handling parallel requests on the same resource.</li>
        <li>Maintained <b>3 Microservices</b>, implementing DB-level logging with <b>AWS Cloudwatch and Newrelic</b> for real-time monitoring, logging, and rapid resolution of production issues.</li>
      </ul>
    ),
    techStack: ['Golang', 'PostgreSQL', 'AWS', 'Redis', 'Docker', 'Kafka'],
  },
  {
    id: 'bezt-intern',
    company: 'Bezt Labs',
    logoWebp: LOGO_BEZTLABS_WEBP,
    logoFallback: LOGO_BEZTLABS_JPEG,
    position: 'Full Stack Developer Intern',
    focus: '',
    start: '2024-10-01',
    until: '2024-12-01',
    rangeEnd: '2025-01-01',
    kind: ROLE_KIND_INTERNSHIP,
    website: 'https://abouv.com',
    description: (
      <ul className="list-disc space-y-1.5 pl-4 text-[13.5px] text-[hsl(var(--muted-foreground))] marker:text-[hsl(var(--faint))]">
        <li><b>Cut follow-up time by 50%</b> with a <b>Google Sheets API</b> powered automated lead pipeline for real-time tracking.</li>
        <li><b>Boosted page load speed by 30%</b> by constructing highly responsive web-pages with effective communication from design team.</li>
      </ul>
    ),
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
  },
]

/**
 * Roles collapsed under one heading per company, in the order they first appear.
 * Two stints at the same employer read as one entry with two roles.
 * @returns {readonly {
 *   company: string,
 *   logoWebp: string,
 *   logoFallback: string,
 *   website: string,
 *   roles: readonly typeof experiences,
 * }[]}
 */
export function groupExperiencesByCompany() {
  /** @type {Map<string, any>} */
  const groups = new Map()
  for (const role of experiences) {
    const existing = groups.get(role.company)
    if (existing) {
      existing.roles.push(role)
      continue
    }
    groups.set(role.company, {
      company: role.company,
      logoWebp: role.logoWebp,
      logoFallback: role.logoFallback,
      website: role.website,
      roles: [role],
    })
  }
  return [...groups.values()]
}
