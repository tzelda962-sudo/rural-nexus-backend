import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const FeaturedVolunteers: CollectionConfig = {
  slug: 'featured-volunteers',
  labels: { singular: 'Featured Volunteer', plural: 'Featured Volunteers' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'location', 'program'],
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
    { name: 'location', type: 'text', required: true },
    {
      name: 'since',
      type: 'text',
      required: true,
      admin: { description: 'Display string, e.g. "March 2022"' },
    },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'program',
      type: 'text',
      required: true,
      admin: { description: 'Program area code or name' },
    },
    {
      name: 'initials',
      type: 'text',
      required: true,
      maxLength: 3,
      admin: { description: 'Fallback avatar text, 1–3 chars' },
    },
    {
      name: 'gradient',
      type: 'text',
      required: true,
      admin: { description: 'Tailwind gradient class for avatar background' },
    },
  ],
}
