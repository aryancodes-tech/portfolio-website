import {
  PROJECT_IMAGE_MYMEMOS,
  PROJECT_IMAGE_PLACEMENTBUDDY,
  PROJECT_IMAGE_WIDGETWALL,
} from '../assets'

/**
 * Side projects. Kept short on purpose: the portfolio leads with backend work.
 * @type {readonly {
 *   name: string,
 *   description: string,
 *   externalLink: string,
 *   githubLink: string,
 *   note: string,
 *   image: string,
 * }[]}
 */
export const projectsData = [
  {
    name: 'MyMemos',
    description: 'Notes on every new tab. Local-first, no account, and nothing leaves the browser.',
    externalLink: 'https://mymemos.in/',
    githubLink: '',
    note: 'Extension',
    image: PROJECT_IMAGE_MYMEMOS,
  },
  {
    name: 'PlacementBuddy',
    description: 'JIIT placement records from the past two years, with sorting and filters.',
    externalLink: 'https://placementbuddy.aryancodes.tech/',
    githubLink: '',
    note: 'Web',
    image: PROJECT_IMAGE_PLACEMENTBUDDY,
  },
  {
    name: 'WidgetWall',
    description: 'A Chrome extension for tasks and time tracking.',
    externalLink: 'https://widgetwall.aryancodes.tech',
    githubLink: 'https://github.com/aryancodes-tech/WidgetWall-Chrome-Extension',
    note: 'Extension',
    image: PROJECT_IMAGE_WIDGETWALL,
  },
]
