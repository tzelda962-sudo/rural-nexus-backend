import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { slugField } from '../fields/slug'

export const NewsEvents: CollectionConfig = {
  slug: 'news-events',
  labels: { singular: 'News / Event', plural: 'News & Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'date', 'isHighlight'],
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
    { name: 'date', type: 'date', required: true },
    { name: 'author', type: 'text' },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Publication', value: 'Publication' },
        { label: 'Field Report', value: 'Field Report' },
        { label: 'Workshop', value: 'Workshop' },
        { label: 'Funding', value: 'Funding' },
        { label: 'Policy', value: 'Policy' },
        { label: 'News', value: 'News' },
      ],
    },
    {
      name: 'isHighlight',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Feature on the homepage' },
    },
    { name: 'content', type: 'richText', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
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
