import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Gallery Item', plural: 'Gallery Items' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'year'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
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
    { name: 'location', type: 'text', required: true },
    { name: 'year', type: 'number', required: true, min: 1900, max: 2100 },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'textarea' },
  ],
}
