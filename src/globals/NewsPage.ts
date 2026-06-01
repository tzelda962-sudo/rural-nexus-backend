import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const NewsPage: GlobalConfig = {
  slug: 'news-page',
  label: 'News & Events Page (/news)',
  admin: {
    description: 'Controls the /news listing page header and CTA. News cards are sourced from the News & Events collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Field Updates' },
        { name: 'heading', type: 'text', defaultValue: 'News & Events' },
        { name: 'body', type: 'textarea', defaultValue: 'Latest field reports, workshops, publications, funding announcements, and policy updates from RuralNexus.' },
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
