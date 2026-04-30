import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const stories = [
  {
    title: 'Sovereignty Through Shared Intelligence: The Andavadoaka Case',
    slug: 'sovereignty-through-shared-intelligence-andavadoaka',
    excerpt:
      "When the hand-pump failed in 2022, the women of this coastal village walked six kilometres daily. We implemented a solar-filtered 'Intelligence Node' that changed everything.",
    location: 'Andavadoaka, Madagascar',
    program: 'Water Governance',
    readTime: '8 min read',
    date: '2026-03-01',
    author: 'Fanja Ratsimbazafy',
    isFeatured: true,
    category: 'Water & Sanitation',
    gradient: 'from-emerald-600 to-leaf-500',
  },
  {
    title: "'The forest is coming back': A decade of reforestation in Xingu",
    slug: 'the-forest-is-coming-back-reforestation-xingu',
    excerpt:
      'Indigenous partners have planted 250,000 native nodes since 2014. We spent a week witnessing the transdisciplinary regrowth.',
    location: 'Xingu Basin, Brazil',
    program: 'Climate Resilience',
    readTime: '6 min read',
    date: '2026-02-01',
    category: 'Reforestation',
    isFeatured: false,
    gradient: 'from-leaf-600 to-cyan-500',
  },
  {
    title: 'Rebuilding Sindh: One Resilience Kit at a Time',
    slug: 'rebuilding-sindh-one-resilience-kit-at-a-time',
    excerpt:
      'Record monsoon rains displaced 4,500 families. A field update from our rapid-action response team six months into implementation.',
    location: 'Sindh, Pakistan',
    program: 'Strategic Response',
    readTime: '5 min read',
    date: '2026-01-01',
    category: 'Disaster Response',
    isFeatured: false,
    gradient: 'from-cyan-600 to-emerald-500',
  },
  {
    title: 'Beyond Ribbon-Cutting: Sustainable Education in Malawi',
    slug: 'beyond-ribbon-cutting-sustainable-education-malawi',
    excerpt:
      'A hard lesson on what sustainable action research looks like in practice. Spoiler: it involves community governance, not just bricks.',
    location: 'Kasungu, Malawi',
    program: 'Capacity Building',
    readTime: '7 min read',
    date: '2025-12-01',
    category: 'Education',
    isFeatured: false,
    gradient: 'from-leaf-500 to-emerald-700',
  },
  {
    title: 'The Solar Nexus: Health Sovereignty in Kisumu',
    slug: 'the-solar-nexus-health-sovereignty-kisumu',
    excerpt:
      'Five years later, the maternal health node remains self-sustaining—powered by sunlight and community-led operational protocols.',
    location: 'Kisumu, Kenya',
    program: 'Biosocial Health',
    readTime: '6 min read',
    date: '2025-12-01',
    category: 'Health',
    isFeatured: false,
    gradient: 'from-emerald-800 to-leaf-600',
  },
  {
    title: 'Listening Protocols: Innovations in the Andes',
    slug: 'listening-protocols-innovations-in-the-andes',
    excerpt:
      'Our regional manager on why the first phase of any nexus project involves zero construction and massive community dialogue.',
    location: 'Cusco, Peru',
    program: 'Food Systems',
    readTime: '4 min read',
    date: '2025-11-01',
    category: 'Food Systems',
    isFeatured: false,
    gradient: 'from-leaf-700 to-emerald-600',
  },
  {
    title: 'Meet the Partners: Association Tanjona',
    slug: 'meet-the-partners-association-tanjona',
    excerpt:
      'A deep-dive conversation with the Madagascan collective that co-manages 70% of our water sovereignty work.',
    location: 'Antananarivo, Madagascar',
    program: 'Strategic Partnerships',
    readTime: '5 min read',
    date: '2025-11-01',
    category: 'Partnerships',
    isFeatured: false,
    gradient: 'from-cyan-400 to-leaf-500',
  },
]

export async function seed(payload: Payload) {
  for (const story of stories) {
    const existing = await payload.find({
      collection: 'stories',
      where: { slug: { equals: story.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed:stories] skip — already exists: ${story.slug}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'stories', data: story as any })
    payload.logger.info(`[seed:stories] created: ${story.slug}`)
  }

  payload.logger.info('[seed:stories] done')
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
