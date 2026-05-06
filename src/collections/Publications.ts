import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { slugField } from '../fields/slug'

export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: { singular: 'Publication', plural: 'Publications' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publicationType', 'category', 'author', 'publishedDate'],
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
    {
      name: 'publicationType',
      type: 'select',
      required: true,
      defaultValue: 'internal',
      options: [
        { label: 'Internal (hosted here)', value: 'internal' },
        { label: 'External (ResearchGate / DOI)', value: 'external' },
      ],
      admin: { position: 'sidebar', description: 'External publications redirect to the provided URL.' },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Full URL to the publication on ResearchGate or another platform.',
        condition: (data) => data.publicationType === 'external',
      },
    },
    { name: 'author', type: 'text' },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Annual Report', value: 'Annual Report' },
        { label: 'Policy Brief', value: 'Policy Brief' },
        { label: 'Research Paper', value: 'Research Paper' },
        { label: 'Workshop', value: 'Workshop' },
        { label: 'Methodology', value: 'Methodology' },
      ],
    },
    { name: 'publishedDate', type: 'date' },
    { name: 'summary', type: 'textarea' },
    { name: 'abstract', type: 'richText' },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'documents',
      admin: {
        description: 'PDF upload — required for public download.',
        condition: (data) => data.publicationType !== 'external',
      },
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
