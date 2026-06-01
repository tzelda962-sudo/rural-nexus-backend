import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const PublicationsPage: GlobalConfig = {
  slug: 'publications-page',
  label: 'Publications Page (/publications)',
  admin: {
    description: 'Controls the /publications listing page header and CTA. Publication cards are sourced from the Publications collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Knowledge Base' },
        { name: 'heading', type: 'text', defaultValue: 'Publications' },
        { name: 'body', type: 'textarea', defaultValue: 'Research papers, policy briefs, annual reports, and workshop outputs from our program teams.' },
      ],
    },
    {
      name: 'ctaSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Catalysing Change Through Collaboration' },
        { name: 'body', type: 'textarea', defaultValue: 'We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.' },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Initiate Contact' },
        { name: 'ctaPath', type: 'text', defaultValue: '/contact' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
