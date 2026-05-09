import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

export const contactPageData = {
  header: {
    heading: 'Partner With Us',
    body: 'Whether you are a farming cooperative, a global funding body, or a fellow research institution, RuralNexus is ready to collaborate.',
  },
  formSection: {
    heading: 'Send an Inquiry',
    body: 'Our PA5 Consultancy team aims to respond to all inquiries within 48 hours.',
    interestAreas: [
      { value: 'PA1 — Water & Sanitation' },
      { value: 'PA3 — Climate Resilience' },
      { value: 'PA4 — Capacity Building' },
      { value: 'PA5 — Strategic Consultancy' },
      { value: 'Other' },
    ],
    submitLabel: 'Submit Inquiry',
    successMessage: 'Message Sent Successfully!',
  },
  hqSection: {
    eyebrow: 'Global Headquarters',
    orgName: 'RuralNexus Innovation Center',
    address: '123 Agritech Valley, Innovation District\nGeneva, 1000, Switzerland',
    directionsUrl: 'https://maps.google.com/?q=Geneva+Switzerland',
  },
  directContacts: {
    eyebrow: 'Direct Contacts',
    contacts: [
      { label: 'Press & Dissemination (PA2)', email: 'press@ruralnexus.org', icon: 'Users' },
      { label: 'Research & Methodology (PA3)', email: 'research@ruralnexus.org', icon: 'Zap' },
    ],
  },
  seo: {
    metaTitle: 'Contact — RuralNexus',
    metaDescription: 'Get in touch with RuralNexus to collaborate on rural resilience and sustainable food systems.',
  },
}

export async function seed(payload: Payload) {
  const existing = await payload.findGlobal({ slug: 'contact-page' })

  if (!existing) {
    console.log('[seed:contact-page] no contact-page global found')
    return
  }

  await payload.updateGlobal({
    slug: 'contact-page',
    data: { ...contactPageData, _status: 'published' },
  })
  console.log('[seed:contact-page] updated contact-page global content')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ;(async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('../payload.config')
    const payload = await getPayload({ config })
    await seed(payload)
    process.exit(0)
  })().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
