import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team Member', plural: 'Team Members' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'parent'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'team',
      hasMany: false,
      admin: { description: 'Reporting line — leave empty for root (Director)' },
    },
    { name: 'bio', type: 'textarea', required: true },
    {
      name: 'expertise',
      type: 'array',
      fields: [{ name: 'skill', type: 'text', required: true }],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
