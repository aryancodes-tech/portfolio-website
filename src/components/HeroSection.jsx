import { FaGithub, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6'
import { Mail } from 'lucide-react'
import {
  CONTACT_EMAIL,
  PERSON_NAME,
  PROFILE_IMAGE_ALT,
  SOCIAL_PROFILES,
} from '../constants/seo'
import { HERO_PHOTO_WEBP, HERO_PHOTO_WEBP_SM } from '../constants/assets'
import { experiences } from '../constants/data/experience'
import { describeTenure } from '../constants/data/tenure'
import {
  ABOUT_TITLE,
  CONNECT_TITLE,
  EMAIL_LABEL,
  HERO_ABOUT,
  HERO_ROLE,
  HERO_STATUS,
  TENURE_FULL_TIME_LABEL,
  TENURE_WITH_INTERNSHIPS_LABEL,
} from '../constants/copy'
import SectionLabel from './SectionLabel'

const SOCIAL_ICONS = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
}

/**
 * Cover, overlapping portrait, about bullets, tenure, and contact chips.
 * Mirrors the profile block the reference sites use, without copying any one of them.
 */
const HeroSection = () => {
  const tenure = describeTenure(experiences)

  return (
    <section id="top" aria-label={`${PERSON_NAME}, ${HERO_ROLE}`}>
      <div className="hero-banner relative h-40 overflow-hidden sm:h-48" aria-hidden>
        <svg className="absolute inset-0 h-full w-full text-[hsl(var(--ink)/0.35)]" viewBox="0 0 720 192" preserveAspectRatio="xMidYMid slice">
          <circle cx="168" cy="132" r="7" fill="currentColor" />
          <circle cx="318" cy="58" r="7" fill="currentColor" />
          <circle cx="486" cy="104" r="7" fill="currentColor" />
          <path d="M175 126 311 64M325 62 479 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="pad relative z-10">
        <img
          src={HERO_PHOTO_WEBP_SM}
          srcSet={`${HERO_PHOTO_WEBP_SM} 320w, ${HERO_PHOTO_WEBP} 560w`}
          sizes="88px"
          alt={PROFILE_IMAGE_ALT}
          width={88}
          height={88}
          decoding="async"
          fetchPriority="high"
          className="-mt-10 h-[4.5rem] w-[4.5rem] rounded-full object-cover ring-4 ring-[hsl(var(--paper))] sm:-mt-12 sm:h-[5.5rem] sm:w-[5.5rem]"
        />
        <h1 className="mt-5 font-display text-[1.65rem] font-semibold leading-none tracking-tight text-[hsl(var(--ink))] sm:text-[1.85rem]">
          {PERSON_NAME}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-[hsl(var(--muted-foreground))]">
          {HERO_ROLE}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--signal))]" aria-hidden />
            {HERO_STATUS}
          </span>
        </p>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Experience length">
          <li className="chip">
            <span className="text-[hsl(var(--ink))]">{tenure.fullTime}</span>
            <span>{TENURE_FULL_TIME_LABEL}</span>
          </li>
          <li className="chip">
            <span className="text-[hsl(var(--ink))]">{tenure.withInternships}</span>
            <span>{TENURE_WITH_INTERNSHIPS_LABEL}</span>
          </li>
        </ul>
      </div>

      <div className="rule pad mt-8 py-8">
        <SectionLabel id="about-heading">{ABOUT_TITLE}</SectionLabel>
        <ul className="mt-5 space-y-3 text-[hsl(var(--muted-foreground))]">
          {HERO_ABOUT.map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--ink))]" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rule pad py-8">
        <SectionLabel id="connect-heading">{CONNECT_TITLE}</SectionLabel>
        <div className="mt-5 flex flex-wrap gap-2">
          {SOCIAL_PROFILES.map((profile) => {
            const Icon = SOCIAL_ICONS[profile.id]
            return (
              <a
                key={profile.id}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={profile.ariaLabel}
                className="contact-chip"
              >
                <Icon size={14} aria-hidden />
                {profile.label}
              </a>
            )
          })}
          <a href={`mailto:${CONTACT_EMAIL}`} className="contact-chip">
            <Mail size={14} strokeWidth={1.75} aria-hidden />
            {EMAIL_LABEL}
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
