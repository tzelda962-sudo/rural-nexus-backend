import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { iconEnumField } from '../fields/iconEnum'

export const ResearchPage: GlobalConfig = {
  slug: 'research-page',
  label: 'Research & Resources Page',
  admin: { description: 'Publications grid is sourced from the Publications collection.' },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Knowledge Sovereignty' },
        { name: 'headlinePrefix', type: 'text', defaultValue: 'Research &' },
        { name: 'headlineEmphasis', type: 'text', defaultValue: 'Resources' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Open access to our transdisciplinary methodologies, policy briefs, and agronomic tools engineered for rural resilience.',
        },
      ],
    },
    {
      name: 'filtersSection',
      type: 'group',
      fields: [
        {
          name: 'searchPlaceholder',
          type: 'text',
          defaultValue: 'Search papers, tools, keywords...',
        },
        {
          name: 'categories',
          type: 'array',
          defaultValue: [
            { label: 'All', icon: 'BookOpen' },
            { label: 'Publication', icon: 'BookOpen' },
            { label: 'Workshop', icon: 'FileText' },
            { label: 'Policy', icon: 'Check' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            iconEnumField({ name: 'icon' }),
          ],
        },
        { name: 'emptyStateHeading', type: 'text', defaultValue: 'No matching resources' },
        {
          name: 'emptyStateBody',
          type: 'textarea',
          defaultValue:
            "We couldn't find any papers or methodologies matching your current filter.",
        },
        { name: 'clearFiltersLabel', type: 'text', defaultValue: 'Clear All Filters' },
      ],
    },
    {
      name: 'submitCtaSection',
      type: 'group',
      fields: [
        { name: 'badge', type: 'text', defaultValue: 'External Contributions' },
        { name: 'heading', type: 'text', defaultValue: 'Methodological Collaboration' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Are you a researcher working on rural resilience? We provide a platform for peer-reviewed methodologies and open-source agronomic tools.',
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Submit Resource Proposal' },
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
