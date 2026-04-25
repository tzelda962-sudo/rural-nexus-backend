import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  label: 'Gallery Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Visual Archive' },
        { name: 'heading', type: 'text', defaultValue: 'Media & Gallery' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'A visual record of the work — from field research to community convenings. Explore the people, places and moments that shape RuralNexus.',
        },
      ],
    },
    {
      name: 'filters',
      type: 'group',
      fields: [
        { name: 'allLabel', type: 'text', defaultValue: 'All' },
        {
          name: 'categoryOrder',
          type: 'array',
          admin: { description: 'Controls the filter bar order on the frontend.' },
          defaultValue: [
            { value: 'Field Work' },
            { value: 'Community' },
            { value: 'Research' },
            { value: 'Events' },
            { value: 'Partners' },
          ],
          fields: [
            {
              name: 'value',
              type: 'select',
              required: true,
              options: [
                { label: 'Field Work', value: 'Field Work' },
                { label: 'Community', value: 'Community' },
                { label: 'Research', value: 'Research' },
                { label: 'Events', value: 'Events' },
                { label: 'Partners', value: 'Partners' },
              ],
            },
          ],
        },
      ],
    },
    { name: 'loadMoreLabel', type: 'text', defaultValue: 'Load more' },
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
