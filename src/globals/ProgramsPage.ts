import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { iconEnumField } from '../fields/iconEnum'

export const ProgramsPage: GlobalConfig = {
  slug: 'programs-page',
  label: 'Programs Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Our Structural Methodology' },
        { name: 'headlinePrefix', type: 'text', defaultValue: 'Our' },
        { name: 'headlineEmphasis', type: 'text', defaultValue: 'Programs.' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus operates through strategic program areas that provide the structural glue needed for multi-stakeholder and transdisciplinary innovation.',
        },
        {
          name: 'headerBadges',
          type: 'array',
          defaultValue: [
            { icon: 'Layers', label: 'Pillar Based Action' },
            { icon: 'Globe', label: 'Transdisciplinary Scope' },
          ],
          fields: [iconEnumField({ name: 'icon' }), { name: 'label', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'ctaSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Join the RuralNexus Ecosystem' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Our programs scale through collaborative intelligence. We are seeking academic partners, field organizations, and technology hub collaborators.',
        },
        {
          name: 'primaryCta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Research Partnership' },
            { name: 'path', type: 'text', defaultValue: '/contact' },
          ],
        },
        {
          name: 'secondaryCta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Regional Collaboration' },
            { name: 'path', type: 'text', defaultValue: '/contact' },
          ],
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
