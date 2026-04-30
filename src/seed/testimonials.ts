import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const testimonials = [
  {
    author: 'Dr. Amara Diallo',
    role: 'Director of Agricultural Policy',
    organization: 'West African Farmers Coalition',
    quote:
      'RuralNexus provided the structural glue needed to transition our local farming initiative into an internationally funded project. Their transdisciplinary methodology is unmatched.',
  },
  {
    author: 'Prof. Lars Eriksson',
    role: 'Chair of Sustainable Development',
    organization: 'Nordic Agronomic Institute',
    quote:
      'Working with RuralNexus transformed how we think about evidence-based implementation. They do not just produce research—they ensure it lands in the communities that need it most.',
  },
  {
    author: 'Fatima Al-Rashid',
    role: 'Programme Officer',
    organization: 'UN Food and Agriculture Organization',
    quote:
      'The rigor of their SDG-aligned methodology gave our bilateral donor the confidence to approve a four-year extension. RuralNexus is a rare organisation that bridges the gap between academic excellence and field reality.',
  },
]

export async function seed(payload: Payload) {
  for (const testimonial of testimonials) {
    const existing = await payload.find({
      collection: 'homepage-testimonials',
      where: { author: { equals: testimonial.author } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(
        `[seed:testimonials] skip — already exists: ${testimonial.author}`,
      )
      continue
    }

    await payload.create({ collection: 'homepage-testimonials', data: testimonial })
    payload.logger.info(`[seed:testimonials] created: ${testimonial.author}`)
  }

  payload.logger.info('[seed:testimonials] done')
}

// Standalone runner
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
