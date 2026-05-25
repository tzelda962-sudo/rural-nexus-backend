import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { iconEnumField } from '../fields/iconEnum'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'eyebrowTags',
          type: 'array',
          defaultValue: [
            { value: 'Action Research' },
            { value: 'Sustainable Innovation' },
            { value: 'Development' },
            { value: 'Food Systems' },
          ],
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        {
          name: 'headlineLine1',
          type: 'text',
          defaultValue: 'Transformative Action research for',
        },
        {
          name: 'headlineEmphasis',
          type: 'text',
          defaultValue: 'sustainable innovations',
          admin: { description: 'Styled italic/gradient span on the frontend.' },
        },
        { name: 'headlineLine2', type: 'text', defaultValue: 'from projects to impacts' },
        {
          name: 'subtitle',
          type: 'textarea',
          defaultValue:
            'Advancing UN sustainable development goals to build resilient food systems through inter-trans-disciplinary research and strategic consultancy.',
        },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        {
          name: 'primaryCta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Explore Our Programs' },
            { name: 'path', type: 'text', defaultValue: '/programs' },
          ],
        },
        {
          name: 'secondaryCta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Who We Are' },
            { name: 'path', type: 'text', defaultValue: '/about' },
          ],
        },
      ],
    },
    {
      name: 'whoWeAre',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Global Identity' },
        { name: 'headingLine1', type: 'text', defaultValue: 'Who We Are:' },
        { name: 'headingLine2Prefix', type: 'text', defaultValue: 'An' },
        { name: 'headingLine2Emphasis', type: 'text', defaultValue: 'International Network' },
        { name: 'headingLine2Suffix', type: 'text', defaultValue: 'of Excellence' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus is more than just an NGO; it is a decentralized network of researchers, agronomists, and project managers dedicated to bridging the gap between theory and practice on the ground.',
        },
        {
          name: 'stats',
          type: 'array',
          defaultValue: [
            { value: '240+', label: 'Research Fellows' },
            { value: '12', label: 'Field Hubs' },
          ],
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Meet the Leadership' },
        { name: 'ctaPath', type: 'text', defaultValue: '/about' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'floatingBadge',
          type: 'group',
          fields: [
            iconEnumField({ name: 'icon', defaultValue: 'Layers' }),
            { name: 'title', type: 'text', defaultValue: 'Scientific Rigor' },
            {
              name: 'body',
              type: 'textarea',
              defaultValue:
                'Our transdisciplinary methodology is strictly mapped to UN SDG frameworks.',
            },
          ],
        },
      ],
    },
    {
      name: 'testimonialsSection',
      type: 'group',
      admin: { description: 'Pulls the first 3 from the HomepageTestimonials collection.' },
      fields: [{ name: 'heading', type: 'text', defaultValue: '"They say about us"' }],
    },
    {
      name: 'newsSection',
      type: 'group',
      admin: { description: 'Sources rows from the News & Events collection.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Latest Insights & Reports' },
        { name: 'latestEventsCount', type: 'number', defaultValue: 3 },
        { name: 'highlightsCount', type: 'number', defaultValue: 2 },
      ],
    },
    {
      name: 'missionSdgSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Aligned with the Global Goals' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Every programmatic area within our operational hub is strictly mapped to the United Nations Sustainable Development Goals, ensuring our interventions contribute to globally recognized outcomes.',
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Read our 2026 Impact Report →' },
        { name: 'ctaPath', type: 'text', defaultValue: '/research' },
        {
          name: 'featuredSdgs',
          type: 'array',
          minRows: 0,
          maxRows: 6,
          defaultValue: [
            { goal: 1 },
            { goal: 2 },
            { goal: 3 },
            { goal: 4 },
            { goal: 13 },
            { goal: 15 },
          ],
          fields: [{ name: 'goal', type: 'number', required: true, min: 1, max: 17 }],
        },
      ],
    },
    {
      name: 'partnersSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Collaborating with global leaders & research institutions',
        },
        {
          name: 'partners',
          type: 'array',
          defaultValue: [
            { name: 'EcoAgri EU', style: 'text' },
            { name: 'GLOBAL HORIZON', style: 'text' },
            { name: 'Hohenheim Institute', style: 'text' },
            { name: 'UN FAO Data', style: 'text' },
            { name: 'AgroNexus', style: 'text' },
          ],
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'logoImage', type: 'upload', relationTo: 'media' },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'text',
              options: [
                { label: 'Text only', value: 'text' },
                { label: 'Logo image', value: 'logo' },
              ],
            },
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
