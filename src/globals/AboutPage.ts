import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Our Leadership' },
        { name: 'heading', type: 'text', defaultValue: 'Who We Are' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus is an international network of researchers, agronomists, and project managers dedicated to empowering rural resilience through evidence-based innovation.',
        },
      ],
    },
    {
      name: 'orgSection',
      type: 'group',
      admin: { description: 'Team org-explorer section. Data comes from the Team collection.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Our International Team' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus operates through a decentralized network of specialized program acquisition cells (PACs) and field technical hubs.',
        },
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
