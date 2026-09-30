import {
  SiAmazonwebservices,
  SiApachekafka,
  SiDocker,
  SiGit,
  SiGithub,
  SiGo,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'
import { Database } from 'lucide-react'

/**
 * Brand mark per tool name, keyed exactly as the tool is written on the site.
 * `color` is omitted where the brand mark is black or white, so those glyphs
 * inherit the text colour and stay legible in both themes.
 * @type {Record<string, { Icon: import('react').ComponentType<{ size?: number }>, color?: string }>}
 */
export const TECH_ICONS = {
  Golang: { Icon: SiGo, color: '#00ADD8' },
  Python: { Icon: SiPython, color: '#3776AB' },
  TypeScript: { Icon: SiTypescript, color: '#3178C6' },
  JavaScript: { Icon: SiJavascript, color: '#E9C02B' },
  SQL: { Icon: Database },
  PostgreSQL: { Icon: SiPostgresql, color: '#5B8DEF' },
  Redis: { Icon: SiRedis, color: '#FF4438' },
  Kafka: { Icon: SiApachekafka },
  AWS: { Icon: SiAmazonwebservices, color: '#FF9900' },
  Docker: { Icon: SiDocker, color: '#2496ED' },
  'Node.js': { Icon: SiNodedotjs, color: '#5FA04E' },
  'Next.js': { Icon: SiNextdotjs },
  React: { Icon: SiReact, color: '#61DAFB' },
  'Tailwind CSS': { Icon: SiTailwindcss, color: '#06B6D4' },
  Git: { Icon: SiGit, color: '#F05032' },
  GitHub: { Icon: SiGithub },
}
