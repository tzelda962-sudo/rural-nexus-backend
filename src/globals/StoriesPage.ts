import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const StoriesPage: GlobalConfig = {
  slug: 'stories-page',
  label: 'Stories / Field Dispatches Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Field Dispatches' },
        { name: 'headlinePrefix', type: 'text', defaultValue: 'Voices' },
        { name: 'headlineEmphasis', type: 'text', defaultValue: 'from the Nexus.' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'First-hand dispatches from our fellows and regional partners—documenting the transdisciplinary journey toward community sovereignty.',
        },
      ],
    },
    {
      name: 'featuredSection',
      type: 'group',
      admin: { description: 'Pulls the first Story with isFeatured=true.' },
      fields: [
        { name: 'overrideCategoryLabel', type: 'text', defaultValue: 'Featured Insight' },
      ],
    },
    {
      name: 'gridSection',
      type: 'group',
      fields: [
        { name: 'headingPrefix', type: 'text', defaultValue: 'More from' },
        { name: 'headingEmphasis', type: 'text', defaultValue: 'the Ground' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'A curated selection of dispatches from our global node network, documenting sustainable breakthroughs and lessons learned.',
        },
        { name: 'filterButtonLabel', type: 'text', defaultValue: 'All Programs' },
        { name: 'loadMoreLabel', type: 'text', defaultValue: 'Explore All Dispatches' },
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
