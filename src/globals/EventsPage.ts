import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const EventsPage: GlobalConfig = {
  slug: 'events-page',
  label: 'Action Hub / Events Page',
  admin: {
    description:
      'Controls the /events Action Hub chrome. Projects tab sources from Programs.initiatives where showInProjectsTab=true. Publications tab sources from the Publications collection.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Development Hub' },
        { name: 'headlinePrefix', type: 'text', defaultValue: 'The' },
        { name: 'headlineEmphasis', type: 'text', defaultValue: 'Action Hub' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'A comprehensive repository for RuralNexus projects, research publications, and international gatherings designed to drive food system transformation.',
        },
      ],
    },
    {
      name: 'tabs',
      type: 'group',
      fields: [
        { name: 'projectsTabLabel', type: 'text', defaultValue: 'Active Projects' },
        { name: 'publicationsTabLabel', type: 'text', defaultValue: 'Publications' },
        { name: 'newsTabLabel', type: 'text', defaultValue: 'News & Events' },
      ],
    },
    {
      name: 'ctaSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Catalysing Change Through Collaboration' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.',
        },
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
