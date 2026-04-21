import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

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
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'e.g. PA1, PA2 — used as a stable identifier on the frontend' },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'color',
      type: 'text',
      required: true,
      admin: { description: 'Tailwind color name (e.g. cyan, emerald)' },
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
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
}
