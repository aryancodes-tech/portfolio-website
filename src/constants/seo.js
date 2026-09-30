/**
 * Canonical site URL (no trailing slash).
 * @type {string}
 */
export const SITE_URL = 'https://www.aryancodes.tech'

/**
 * Primary document path used for canonical and Open Graph URLs.
 * @type {string}
 */
export const SITE_PATH = '/'

/**
 * Full legal / display name.
 * @type {string}
 */
export const PERSON_NAME = 'Aryan Gupta'

/**
 * Target search phrases for meta keywords, schema knowsAbout, and on-page copy.
 * @type {readonly string[]}
 */
export const SEO_KEYWORDS = [
  'Aryan Gupta',
  'Aryan Gupta Backend Developer',
  'Aryan Gupta Software Engineer',
  'Aryan Gupta SDE',
  'Aryan Gupta SDE 1',
  'Aryan Gupta Omniful',
  'Aryan Gupta JIIT',
  'Backend Developer',
  'Backend Engineer',
  'Software Developer',
  'Software Engineer',
  'Software Development Engineer',
  'SDE 1',
  'Golang Developer',
  'Go Developer',
  'Python Developer',
  'Microservices Engineer',
  'Distributed Systems Engineer',
  'AWS Developer',
  'REST API Developer',
  'PostgreSQL Developer',
  'Startup Software Engineer',
  'Product Engineer',
  'Supply Chain Software Engineer',
  'Logistics Software Engineer',
  'Backend Architecture',
  'System Design',
  'High Performance Backend',
]

/**
 * Comma-separated keywords for the meta keywords tag.
 * @type {string}
 */
export const META_KEYWORDS = SEO_KEYWORDS.join(', ')

/**
 * Document title (aim for under ~60 characters in SERPs).
 * @type {string}
 */
export const META_TITLE =
  'Aryan Gupta | Backend Developer & Software Engineer'

/**
 * Document title for the custom 404 page.
 * @type {string}
 */
export const NOT_FOUND_META_TITLE = '404 — Page Not Found | Aryan Gupta'

/**
 * Meta description (~150–160 characters).
 * @type {string}
 */
export const META_DESCRIPTION =
  'Aryan Gupta — Backend Developer & Software Engineer (SDE-1) at Omniful AI. Golang, Python, microservices, REST APIs, PostgreSQL, AWS. JIIT. System design & high-performance backends.'

/** Open Graph site name. @type {string} */
export const OG_SITE_NAME = 'Aryan Gupta Portfolio'

/** Open Graph / Twitter title. @type {string} */
export const OG_TITLE = META_TITLE

/** Open Graph / Twitter description. @type {string} */
export const OG_DESCRIPTION =
  'Portfolio of Aryan Gupta — Backend Developer, Software Engineer (SDE-1) at Omniful AI. Golang, microservices, distributed systems, logistics & supply chain software.'

/** Open Graph image absolute URL. @type {string} */
export const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`

/** Alt text for OG / Twitter preview images. @type {string} */
export const OG_IMAGE_ALT =
  'Aryan Gupta — Backend Developer, Software Engineer, Golang developer at Omniful AI'

/** Contact email (public). @type {string} */
export const CONTACT_EMAIL = 'aryancodes.tech@gmail.com'

/** Social profile URLs for schema sameAs. @type {readonly string[]} */
export const SAME_AS = [
  'https://github.com/aryancodes-tech',
  'https://linkedin.com/in/aryancodes-tech',
  'https://x.com/aryancodes_tech',
]

/**
 * Social profiles for the contact section (url + accessible label).
 * @type {readonly { url: string, ariaLabel: string, label: string, id: 'github' | 'linkedin' | 'x' }[]}
 */
export const SOCIAL_PROFILES = [
  {
    id: 'github',
    url: 'https://github.com/aryancodes-tech',
    ariaLabel: 'Aryan Gupta on GitHub',
    label: 'GitHub',
  },
  {
    id: 'linkedin',
    url: 'https://linkedin.com/in/aryancodes-tech',
    ariaLabel: 'Aryan Gupta on LinkedIn',
    label: 'LinkedIn',
  },
  {
    id: 'x',
    url: 'https://x.com/aryancodes_tech',
    ariaLabel: 'Aryan Gupta on X',
    label: 'X',
  },
]

/**
 * Skills and topics for schema.org knowsAbout.
 * @type {readonly string[]}
 */
export const KNOWS_ABOUT = [
  'Golang',
  'Go',
  'Python',
  'Backend Development',
  'Backend Architecture',
  'Software Engineering',
  'Microservices',
  'Distributed Systems',
  'REST APIs',
  'PostgreSQL',
  'AWS',
  'Redis',
  'Docker',
  'Kafka',
  'System Design',
  'High Performance Backend',
  'Supply Chain Software',
  'Logistics Software',
  'Warehouse Management Systems',
]

/**
 * Hero tagline shown above the name (visible, keyword-aware).
 * @type {string}
 */
export const HERO_KICKER = 'Backend engineer · Omniful AI'

/**
 * Hero supporting paragraph (plain text for static LCP shell and meta).
 * @type {string}
 */
export const HERO_SUMMARY_PLAIN =
  'I work on warehouse software at Omniful. Most of what I ship never shows up in a screenshot: the search, the lock, and the path an order takes before it is packed.'

/**
 * Accessible label for the profile image.
 * @type {string}
 */
export const PROFILE_IMAGE_ALT =
  'Aryan Gupta — Backend Developer, Software Engineer, and Golang developer at Omniful AI, JIIT alumnus'

/**
 * schema.org @graph for index.html JSON-LD.
 * @returns {object}
 */
export function buildStructuredDataGraph() {
  const pageUrl = `${SITE_URL}${SITE_PATH}`
  const personId = `${pageUrl}#person`
  const websiteId = `${pageUrl}#website`
  const profileId = `${pageUrl}#profilepage`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: PERSON_NAME,
        givenName: 'Aryan',
        familyName: 'Gupta',
        url: pageUrl,
        image: OG_IMAGE_URL,
        email: `mailto:${CONTACT_EMAIL}`,
        jobTitle: [
          'SDE-1',
          'Backend Developer',
          'Software Engineer',
          'Golang Developer',
          'Microservices Engineer',
        ],
        description: META_DESCRIPTION,
        worksFor: {
          '@type': 'Organization',
          name: 'Omniful AI',
          url: 'https://omniful.ai',
          description: 'Supply chain and logistics software platform',
        },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Jaypee Institute of Information Technology',
          alternateName: ['JIIT', 'Jaypee Institute of Information Technology Noida'],
          url: 'https://www.jiit.ac.in',
        },
        sameAs: [...SAME_AS],
        knowsAbout: [...KNOWS_ABOUT],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: OG_SITE_NAME,
        url: pageUrl,
        description: META_DESCRIPTION,
        publisher: { '@id': personId },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'ProfilePage',
        '@id': profileId,
        url: pageUrl,
        name: META_TITLE,
        description: META_DESCRIPTION,
        mainEntity: { '@id': personId },
        isPartOf: { '@id': websiteId },
        inLanguage: 'en-IN',
      },
    ],
  }
}
