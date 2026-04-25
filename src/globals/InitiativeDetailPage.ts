import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const InitiativeDetailPage: GlobalConfig = {
  slug: 'initiative-detail-page',
  label: 'Initiative Detail Page (chrome)',
  admin: {
    description:
      'Applied to every /programs/:programSlug/initiatives/:initiativeSlug page. Initiative content comes from the Programs.initiatives[] array.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    { name: 'relatedHeading', type: 'text', defaultValue: 'Part of' },
    { name: 'ctaHeading', type: 'text', defaultValue: 'Support This Initiative' },
    { name: 'ctaPath', type: 'text', defaultValue: '/contact' },
    { name: 'backLinkLabel', type: 'text', defaultValue: 'Back to program' },
  ],
}
