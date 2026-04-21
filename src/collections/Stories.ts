import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Stories: CollectionConfig = {
  slug: 'stories',
  labels: { singular: 'Story', plural: 'Success Stories' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'date', 'isFeatured'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'program', type: 'text', required: true },
    {
      name: 'readTime',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "5 min read"' },
    },
    { name: 'date', type: 'date', required: true },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'category', type: 'text', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
  ],
}
