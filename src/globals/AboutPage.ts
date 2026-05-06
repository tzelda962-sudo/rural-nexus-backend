import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAnyone } from '../access/isAnyone'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  access: { read: isAnyone, update: isAdminOrEditor },
  versions: { drafts: true },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Who We Are' },
        { name: 'heading', type: 'text', defaultValue: 'Empowering Rural Resilience' },
        { name: 'headingEmphasis', type: 'text', defaultValue: 'Globally.' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus is an international network of researchers, agronomists, and project managers dedicated to empowering rural resilience through evidence-based innovation and transdisciplinary collaboration.',
        },
      ],
    },
    {
      name: 'missionVision',
      label: 'Mission & Vision',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Our Mission & Vision' },
        {
          name: 'mission',
          label: 'Mission Statement',
          type: 'textarea',
          defaultValue:
            'To catalyze sustainable agricultural transformation in rural communities across Africa and beyond, by connecting scientific knowledge with local innovation systems and strengthening the capacities of farmers, advisors, and development actors.',
        },
        {
          name: 'vision',
          label: 'Vision Statement',
          type: 'textarea',
          defaultValue:
            'A world where rural communities are empowered to co-create resilient food systems, equitable value chains, and adaptive livelihoods — grounded in knowledge sovereignty and environmental stewardship.',
        },
      ],
    },
    {
      name: 'approachSection',
      label: 'Our Approach',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'How We Work' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'RuralNexus operates through a transdisciplinary methodology that bridges the gap between academic research and field practice. We embed researchers and practitioners within communities, foster multi-stakeholder innovation platforms, and co-design context-specific solutions.',
        },
        {
          name: 'pillars',
          label: 'Approach Pillars',
          type: 'array',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
          defaultValue: [
            {
              title: 'Participatory Action Research',
              description: 'We involve communities as co-investigators — not just beneficiaries — ensuring that research questions and methodologies reflect lived realities.',
            },
            {
              title: 'Multi-Stakeholder Innovation Platforms',
              description: 'We convene farmers, extension workers, researchers, and policymakers in structured dialogue to co-create scalable agricultural innovations.',
            },
            {
              title: 'Knowledge Sovereignty',
              description: 'We prioritize local knowledge systems and ensure communities retain ownership of the innovations and tools co-developed with them.',
            },
            {
              title: 'Evidence-Based Scaling',
              description: 'Every intervention is rigorously documented and assessed for adoption potential before being recommended for wider dissemination.',
            },
          ],
        },
      ],
    },
    {
      name: 'geographySection',
      label: 'Geographic Focus',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Where We Work' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Our interventions span Sub-Saharan Africa, with active field hubs in Cameroon, Burkina Faso, Tanzania, Uganda, Kenya, Ghana, Angola, Niger, and Madagascar. We also maintain research partnerships across Europe and South Asia.',
        },
        {
          name: 'regions',
          type: 'array',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'countries', type: 'text', admin: { description: 'Comma-separated list' } },
          ],
          defaultValue: [
            { name: 'West Africa', countries: 'Burkina Faso, Ghana, Niger, Cameroon' },
            { name: 'East Africa', countries: 'Tanzania, Uganda, Kenya' },
            { name: 'Southern Africa', countries: 'Zambia, Angola' },
            { name: 'Indian Ocean', countries: 'Madagascar' },
          ],
        },
      ],
    },
    {
      name: 'valuesSection',
      label: 'Core Values',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Our Core Values' },
        {
          name: 'values',
          type: 'array',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
          defaultValue: [
            { title: 'Community First', description: 'Every decision is filtered through the question: does this serve the communities we work with?' },
            { title: 'Scientific Integrity', description: 'We uphold rigorous, reproducible research standards while staying responsive to the complexity of real-world contexts.' },
            { title: 'Inclusivity', description: 'We actively work to amplify the voices of women, youth, and marginalized groups within agricultural innovation systems.' },
            { title: 'Transparency', description: 'We publish our methods, results, and failures openly — contributing to the global knowledge commons.' },
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
