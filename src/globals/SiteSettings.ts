import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'
import { iconEnumField } from '../fields/iconEnum'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  dbName: 'site',
  admin: {
    description: 'Brand, navigation, footer, social, and SEO defaults applied site-wide.',
  },
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true, defaultValue: 'RuralNexus' },
        {
          name: 'logoLetter',
          type: 'text',
          maxLength: 2,
          defaultValue: 'R',
          admin: { description: 'Single-letter logomark shown in the hex-mask header tile.' },
        },
        {
          name: 'logoImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional logo image. Replaces the letter logomark when set.' },
        },
        {
          name: 'tagline',
          type: 'text',
          defaultValue:
            'Empowering Rural Resilience. Action Research, Innovation, and Development for resilient food systems.',
        },
      ],
    },
    {
      name: 'navigation',
      type: 'group',
      fields: [
        {
          name: 'primaryLinks',
          type: 'array',
          labels: { singular: 'Link', plural: 'Primary Links' },
          defaultValue: [
            { label: 'Home', path: '/' },
            {
              label: 'Who We Are',
              path: '/about',
              children: [
                { label: 'Overview', path: '/about', description: 'Our mission & vision', icon: 'Info' },
                { label: 'Impact Metrics', path: '/impact', description: 'Measurable outcomes', icon: 'BarChart3' },
                { label: 'Field Stories', path: '/stories', description: 'Voices from the ground', icon: 'MessageSquareQuote' },
              ],
            },
            {
              label: 'What We Do',
              path: '/programs',
              children: [
                { label: 'Our Programs', path: '/programs', description: 'Core strategic pillars', icon: 'Layers' },
                { label: 'Action Hub', path: '/events', description: 'Projects & Publications', icon: 'Rocket' },
                { label: 'Research & Tools', path: '/research', description: 'Methodological resources', icon: 'BookOpen' },
              ],
            },
            { label: 'Gallery', path: '/gallery' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'path', type: 'text', required: true },
            {
              name: 'children',
              type: 'array',
              labels: { singular: 'Child Link', plural: 'Dropdown Items' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'path', type: 'text', required: true },
                { name: 'description', type: 'text' },
                iconEnumField({ name: 'icon' }),
              ],
            },
          ],
        },
        {
          name: 'ctaButton',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Contact Us' },
            { name: 'path', type: 'text', defaultValue: '/contact' },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'quickLinks',
          type: 'array',
          defaultValue: [
            { label: 'Home', path: '/' },
            { label: 'Who We Are', path: '/about' },
            { label: 'Impact Reports', path: '/impact' },
            { label: 'Field Dispatches', path: '/stories' },
            { label: 'Methodology Repository', path: '/research' },
            { label: 'Gallery', path: '/gallery' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'path', type: 'text', required: true },
          ],
        },
        { name: 'contactPhone', type: 'text', defaultValue: '+1 (555) 123-4567' },
        { name: 'contactEmail', type: 'email', defaultValue: 'info@ruralnexus.org' },
        { name: 'contactAddress', type: 'text', defaultValue: '123 Innovation Drive, Agro Hub' },
        {
          name: 'copyrightText',
          type: 'text',
          defaultValue: '© {year} RuralNexus. All rights reserved.',
          admin: { description: 'Use {year} to auto-insert the current year.' },
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      labels: { singular: 'Social Link', plural: 'Social Links' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'defaultTitle', type: 'text', defaultValue: 'RuralNexus' },
        {
          name: 'defaultDescription',
          type: 'textarea',
          defaultValue:
            'Empowering Rural Resilience. Action Research, Innovation, and Development for resilient food systems.',
        },
        { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
