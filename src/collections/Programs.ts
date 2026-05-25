import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { slugField } from '../fields/slug'
import { iconEnumField } from '../fields/iconEnum'

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: { singular: 'Program Area', plural: 'Program Areas' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'color'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: { drafts: true },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'e.g. PA1, PA2 — used as a stable identifier on the frontend' },
    },
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: { description: 'Short description for the "What We Do" boxes on the About page (2–3 sentences).' },
    },
    {
      name: 'color',
      type: 'text',
      required: true,
      admin: { description: 'Tailwind color name (e.g. cyan, emerald)' },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Hero image for the program detail page' },
    },
    {
      name: 'longDescription',
      type: 'richText',
      admin: { description: 'Body content for the program detail page' },
    },
    {
      name: 'methodologySection',
      type: 'richText',
      admin: { description: '"How we work on this pillar" section' },
    },
    {
      name: 'sdgs',
      type: 'array',
      labels: { singular: 'SDG', plural: 'SDGs' },
      fields: [
        {
          name: 'goal',
          type: 'number',
          required: true,
          min: 1,
          max: 17,
        },
      ],
    },
    {
      name: 'initiatives',
      type: 'array',
      labels: { singular: 'Initiative', plural: 'Initiatives / Field Projects' },
      admin: {
        description:
          'Field projects under this program. Initiatives with "showInProjectsTab" are surfaced in the site-wide Action Hub Projects tab.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        slugField('title', { unique: false, sidebar: false }),
        { name: 'description', type: 'textarea', required: true },
        { name: 'location', type: 'text', admin: { description: 'e.g. "Turkana, Kenya"' } },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'Active',
          options: [
            { label: 'Planning', value: 'Planning' },
            { label: 'Active', value: 'Active' },
            { label: 'Scaling', value: 'Scaling' },
            { label: 'Field Testing', value: 'Field Testing' },
            { label: 'Completed', value: 'Completed' },
          ],
        },
        { name: 'stat', type: 'text', admin: { description: 'Headline metric, e.g. "12 villages, 4.5M L/yr"' } },
        iconEnumField({ name: 'icon', description: 'Icon shown on the initiative card.' }),
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
        { name: 'longDescription', type: 'richText', admin: { description: 'Body content for the initiative detail page' } },
        {
          name: 'showInProjectsTab',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'If on, this initiative appears in the site-wide Action Hub Projects tab.' },
        },
      ],
    },
    {
      name: 'keyActivities',
      type: 'array',
      labels: { singular: 'Key Activity', plural: 'Key Activities' },
      admin: { description: 'Key activities shown in the program detail panel on the Programs page.' },
      fields: [{ name: 'activity', type: 'text', required: true }],
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
