import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const ContactInquiries: CollectionConfig = {
  slug: 'contact-inquiries',
  labels: { singular: 'Contact Inquiry', plural: 'Contact Inquiries' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'organization', 'interestArea', 'createdAt'],
    description: 'Submissions from the /contact form — admin read-only',
  },
  access: {
    // Public create is handled by the dedicated POST /api/contact endpoint;
    // raw collection create is disabled to force server-side validation + email side effect.
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'organization', type: 'text' },
    { name: 'interestArea', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
  timestamps: true,
}
