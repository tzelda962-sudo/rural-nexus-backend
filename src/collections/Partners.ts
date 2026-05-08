import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partners & Collaborators' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'abbreviation', 'type', 'continent', 'country'],
    description: 'Collaborating universities, research institutes, and NGOs.',
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'abbreviation',
      type: 'text',
      admin: { description: 'Short identifier, e.g. "IITA", "ZALF", "CIRAD".' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'University', value: 'University' },
        { label: 'Research Institute', value: 'Research Institute' },
        { label: 'NGO', value: 'NGO' },
        { label: 'Funding Agency', value: 'Funding Agency' },
      ],
    },
    {
      name: 'continent',
      type: 'select',
      required: true,
      options: [
        { label: 'Europe', value: 'Europe' },
        { label: 'Africa', value: 'Africa' },
        { label: 'Global', value: 'Global' },
      ],
    },
    { name: 'country', type: 'text', required: true },
    {
      name: 'show',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Toggle whether this partner/collaborator appears on the network page.',
      },
    },
    { name: 'website', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
  ],
}
