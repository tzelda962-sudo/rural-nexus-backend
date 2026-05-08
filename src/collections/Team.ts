import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team Member', plural: 'Team Members' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'memberType', 'show'],
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
      name: 'memberType',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      admin: { description: 'Controls how this member is grouped and displayed on the site.' },
      options: [
        { label: 'CEO / Managing Director', value: 'ceo' },
        { label: 'PA Manager', value: 'pa-manager' },
        { label: 'Advisory Board', value: 'advisory' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    {
      name: 'show',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Toggle whether this team member appears on the site.',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'team',
      hasMany: false,
      admin: {
        description: 'Reporting line — leave empty for root (Director) and advisory members.',
      },
    },
    { name: 'bio', type: 'textarea' },
    {
      name: 'expertise',
      type: 'array',
      fields: [{ name: 'skill', type: 'text', required: true }],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
