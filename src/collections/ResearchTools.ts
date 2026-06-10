import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const ResearchTools: CollectionConfig = {
  slug: 'research-tools',
  labels: { singular: 'Research Tool', plural: 'Research Tools' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
    description: 'Methodologies and tools featured at the top of the Research & Resources page.',
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Controls display order (lower numbers first).' },
    },
  ],
}
