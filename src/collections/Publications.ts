import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { slugField } from '../fields/slug'

export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: { singular: 'Publication', plural: 'Publications' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'publishedDate'],
    description: 'Research papers, policy briefs, annual reports, and workshop outputs.',
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
    { name: 'author', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Annual Report', value: 'Annual Report' },
        { label: 'Policy Brief', value: 'Policy Brief' },
        { label: 'Research Paper', value: 'Research Paper' },
        { label: 'Workshop', value: 'Workshop' },
        { label: 'Methodology', value: 'Methodology' },
      ],
    },
    { name: 'publishedDate', type: 'date', required: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'abstract', type: 'richText' },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'documents',
      admin: { description: 'PDF upload — required for public download.' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional cover image for listings.' },
    },
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
