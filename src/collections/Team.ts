import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team Member', plural: 'Team Members' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'memberType', 'order', 'show'],
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
      name: 'order',
      type: 'number',
      admin: {
        description: 'Controls display order (lower numbers first). Leave empty to sort last.',
        position: 'sidebar',
      },
    },
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
      name: 'location',
      type: 'text',
      admin: { description: 'e.g. "Nairobi, Kenya" — shown for advisory board / collaborating experts.' },
    },
    {
      name: 'link',
      type: 'group',
      label: 'External Link',
      admin: { description: 'Optional "Know more" link shown on the network/collaborators page (e.g. a place, university, or profile).' },
      fields: [
        { name: 'linkLabel', type: 'text', defaultValue: 'Know more' },
        { name: 'linkUrl', type: 'text', admin: { description: 'Full URL, e.g. https://...' } },
      ],
    },
    {
      name: 'expertise',
      type: 'array',
      fields: [{ name: 'skill', type: 'text', required: true }],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'programAreas',
      type: 'relationship',
      relationTo: 'programs',
      hasMany: true,
      admin: { description: 'Program areas this team member is associated with.' },
    },
  ],
}
