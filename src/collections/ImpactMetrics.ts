import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const ImpactMetrics: CollectionConfig = {
  slug: 'impact-metrics',
  labels: { singular: 'Impact Metric', plural: 'Impact Metrics' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'suffix'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'value', type: 'number', required: true },
    {
      name: 'suffix',
      type: 'text',
      admin: { description: 'e.g. "+", "%", "K"' },
    },
    { name: 'label', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
  ],
}
