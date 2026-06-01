import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  label: 'Active Projects Page (/projects)',
  admin: {
    description: 'Controls the /projects page header and CTA. Project cards are sourced from Programs → Initiatives where showcase=true.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'What We Do' },
        { name: 'heading', type: 'text', defaultValue: 'Active Projects' },
        { name: 'body', type: 'textarea', defaultValue: 'Field initiatives and development projects currently underway across our program areas.' },
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
