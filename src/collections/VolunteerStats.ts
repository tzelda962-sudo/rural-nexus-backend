import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const VolunteerStats: CollectionConfig = {
  slug: 'volunteer-stats',
  labels: { singular: 'Volunteer Stat', plural: 'Volunteer Stats' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'value'],
    description: 'The 4 counter tiles shown on the Volunteer page',
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: { description: 'Display string, e.g. "120+"' },
    },
    { name: 'label', type: 'text', required: true },
  ],
}
