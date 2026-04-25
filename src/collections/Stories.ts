import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { slugField } from '../fields/slug'

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
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
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
    { name: 'author', type: 'text', admin: { description: 'Shown on the story detail page' } },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'category', type: 'text', required: true },
    {
      name: 'gradient',
      type: 'text',
      admin: {
        description:
          'Tailwind gradient stops for the placeholder card header, e.g. "from-emerald-600 to-leaf-500".',
      },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
