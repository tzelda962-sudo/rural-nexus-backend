import { getPayload } from 'payload'
import config from '../payload.config'

const publications = [
  {
    title: 'Impact Report 2026: The Transdisciplinary Gap',
    slug: 'impact-report-2026-transdisciplinary-gap',
    author: 'RuralNexus PAC3 Team',
    category: 'Annual Report',
    publishedDate: '2026-03-01',
    summary:
      'A comprehensive review of transdisciplinary research outcomes across RuralNexus field hubs in 2025, highlighting where theory-to-practice gaps persist and how our methodology is closing them.',
  },
  {
    title: 'Drought Resilience in Smallholder Systems',
    slug: 'drought-resilience-smallholder-systems',
    author: 'Dr. Sarah K. et al.',
    category: 'Policy Brief',
    publishedDate: '2026-02-01',
    summary:
      'Evidence-based policy recommendations for strengthening drought resilience among smallholder farmers in semi-arid sub-Saharan Africa, drawing on three seasons of field data.',
  },
  {
    title: 'Action Research: Methodological Sovereignty',
    slug: 'action-research-methodological-sovereignty',
    author: 'RuralNexus PAC4 Education',
    category: 'Research Paper',
    publishedDate: '2026-01-01',
    summary:
      'Examines how community-embedded action research reclaims knowledge production from extractive academic models, with case studies from the RuralNexus Education & Empowerment pillar.',
  },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const pub of publications) {
    const existing = await payload.find({
      collection: 'publications',
      where: { slug: { equals: pub.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed] skip — already exists: ${pub.slug}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'publications', data: pub as any })
    payload.logger.info(`[seed] created: ${pub.slug}`)
  }

  payload.logger.info('[seed] publications done')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
