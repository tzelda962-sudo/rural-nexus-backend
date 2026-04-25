import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const ProgramDetailPage: GlobalConfig = {
  slug: 'program-detail-page',
  label: 'Program Detail Page (chrome)',
  admin: {
    description:
      'Applied to every /programs/:slug page. Program-specific content comes from the Programs collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    { name: 'initiativesHeading', type: 'text', defaultValue: 'Active Field Initiatives' },
    { name: 'ctaHeading', type: 'text', defaultValue: 'Partner With This Program' },
    { name: 'ctaPath', type: 'text', defaultValue: '/contact' },
    { name: 'backLinkLabel', type: 'text', defaultValue: 'Back to All Programs' },
  ],
}
