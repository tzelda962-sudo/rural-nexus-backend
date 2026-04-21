import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const HomepageTestimonials: CollectionConfig = {
  slug: 'homepage-testimonials',
  labels: { singular: 'Testimonial', plural: 'Homepage Testimonials' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'organization', 'role'],
  },
  access: {
    read: isAnyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'author', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'organization', type: 'text' },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
