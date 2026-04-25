import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const StoryDetailPage: GlobalConfig = {
  slug: 'story-detail-page',
  label: 'Story Detail Page (chrome)',
  admin: {
    description:
      'Applied to every /stories/:slug page. Per-story content comes from the Stories collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    { name: 'backLinkLabel', type: 'text', defaultValue: 'Back to Field Dispatches' },
    { name: 'relatedHeading', type: 'text', defaultValue: 'More dispatches' },
  ],
}
