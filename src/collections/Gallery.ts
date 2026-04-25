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
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '4/3',
      options: [
        { label: '4 / 3', value: '4/3' },
        { label: 'Square', value: 'square' },
        { label: '16 / 10', value: '16/10' },
        { label: '3 / 4 (portrait)', value: '3/4' },
      ],
    },
    {
      name: 'gridSize',
      type: 'select',
      defaultValue: '1x1',
      options: [
        { label: '1 × 1 (standard)', value: '1x1' },
        { label: '2 × 1 (wide)', value: '2x1' },
        { label: '1 × 2 (tall)', value: '1x2' },
      ],
      admin: { description: 'Controls how many columns/rows this item spans in the masonry grid.' },
    },
    {
      name: 'gradient',
      type: 'text',
      admin: { description: 'Tailwind gradient stops shown as a placeholder while the image loads.' },
    },
  ],
}
