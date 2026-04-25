import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { iconEnumField } from '../fields/iconEnum'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Partner With Us' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Whether you are a farming cooperative, a global funding body, or a fellow research institution, RuralNexus is ready to collaborate.',
        },
      ],
    },
    {
      name: 'formSection',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Send an Inquiry' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Our PA5 Consultancy team aims to respond to all inquiries within 48 hours.',
        },
        {
          name: 'interestAreas',
          type: 'array',
          defaultValue: [
            { value: 'PA1 — Water & Sanitation' },
            { value: 'PA3 — Climate Resilience' },
            { value: 'PA4 — Capacity Building' },
            { value: 'PA5 — Strategic Consultancy' },
            { value: 'Other' },
          ],
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        { name: 'submitLabel', type: 'text', defaultValue: 'Submit Inquiry' },
        { name: 'successMessage', type: 'text', defaultValue: 'Message Sent Successfully!' },
      ],
    },
    {
      name: 'hqSection',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Global Headquarters' },
        { name: 'orgName', type: 'text', defaultValue: 'RuralNexus Innovation Center' },
        {
          name: 'address',
          type: 'textarea',
          defaultValue: '123 Agritech Valley, Innovation District\nGeneva, 1000, Switzerland',
        },
        { name: 'directionsUrl', type: 'text', defaultValue: '#' },
      ],
    },
    {
      name: 'directContacts',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Direct Contacts' },
        {
          name: 'contacts',
          type: 'array',
          defaultValue: [
            { label: 'Press & Dissemination (PA2)', email: 'press@ruralnexus.org', icon: 'Users' },
            { label: 'Research & Methodology (PA3)', email: 'research@ruralnexus.org', icon: 'Zap' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            iconEnumField({ name: 'icon' }),
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
