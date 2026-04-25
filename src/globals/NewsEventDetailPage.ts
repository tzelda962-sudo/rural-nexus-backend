import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const NewsEventDetailPage: GlobalConfig = {
  slug: 'news-event-detail-page',
  label: 'News / Event Detail Page (chrome)',
  admin: {
    description:
      'Applied to every /news/:slug page. Per-article content comes from the NewsEvents collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    { name: 'backLinkLabel', type: 'text', defaultValue: 'Back to Overview' },
    {
      name: 'relatedHeading',
      type: 'text',
      defaultValue: 'Related in {category}',
      admin: { description: 'Use {category} to inject the current article category.' },
    },
    { name: 'notFoundHeading', type: 'text', defaultValue: 'Article Not Found' },
    {
      name: 'notFoundBody',
      type: 'textarea',
      defaultValue:
        'The requested academic article or news event could not be located.',
    },
    { name: 'notFoundCtaLabel', type: 'text', defaultValue: 'Return Home' },
    { name: 'notFoundCtaPath', type: 'text', defaultValue: '/' },
  ],
}
