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
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Background image for the header section. If empty, a default image is used.' },
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
            'Our mission is to advance sustainable agrifood systems and inclusive rural transformation through transdisciplinary research, multi-stakeholder collaboration, and innovation that connects scientific knowledge with local action.',
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
            'RuralNexus operates at the intersection of research, policy, and practice. We work across multiple program areas — each addressing a critical dimension of sustainable rural transformation — and our approach is built on collaboration, evidence, and local ownership.',
        },
        { name: 'whatWeDoSubheading', type: 'text', defaultValue: 'What We Do?' },
        {
          name: 'whatWeDoBullets',
          label: 'What We Do — Bullet Points',
          type: 'array',
          fields: [{ name: 'bullet', type: 'text', required: true }],
          defaultValue: [
            { bullet: 'Design and implement transdisciplinary research programmes in agrifood systems' },
            { bullet: 'Facilitate multi-stakeholder innovation platforms connecting researchers, farmers, and policymakers' },
            { bullet: 'Co-develop context-specific tools and methodologies for sustainable rural transformation' },
            { bullet: 'Provide technical assistance, capacity building, and institutional strengthening' },
            { bullet: 'Publish and disseminate open-access knowledge resources for the global development community' },
          ],
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
            { name: 'East Africa', countries: 'Tanzania, Uganda, Kenya, Ethiopia' },
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
