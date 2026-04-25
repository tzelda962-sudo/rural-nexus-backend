import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const ImpactPage: GlobalConfig = {
  slug: 'impact-page',
  label: 'Impact Page',
  admin: { description: 'Metric cards are sourced from the ImpactMetrics collection.' },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Quantifiable Change' },
        { name: 'headlinePrefix', type: 'text', defaultValue: 'The Intelligence' },
        { name: 'headlineEmphasis', type: 'text', defaultValue: 'behind the mission.' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'We publish every outcome—from node health metrics to direct economic shifts—within our open intelligence network, ensuring peer-reviewed transparency.',
        },
      ],
    },
    {
      name: 'assessmentSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Open Assessment Protocol' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Our impact data is verified through a transdisciplinary assessment protocol combining community-led monitoring and independent peer review.',
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Explore Methodologies' },
        { name: 'ctaPath', type: 'text', defaultValue: '/research' },
        {
          name: 'badges',
          type: 'array',
          defaultValue: [
            { value: '100%', label: 'Geographical Data' },
            { value: '24/7', label: 'Node Monitoring' },
            { value: 'Peer', label: 'Reviewed Outcomes' },
            { value: 'Public', label: 'Ledger Access' },
          ],
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
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
