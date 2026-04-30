import type { Payload } from 'payload'
import { fileURLToPath } from 'url'
import { makeRichText } from './utils'

// Dates converted from DD.MM.YYYY to ISO
const newsEvents = [
  {
    title: 'Annual Global Agriculture Summit 2026',
    slug: 'annual-global-agriculture-summit-2026',
    date: '2026-01-21',
    summary:
      'RuralNexus leadership will keynote the opening session on bridging the gap between high-tech sensors and traditional rural farming knowledge.',
    category: 'Workshop',
    isHighlight: true,
    content: makeRichText(`
      We are thrilled to announce that Dr. Jane Smith, Director of RuralNexus, will deliver the opening keynote
      at the Annual Global Agriculture Summit 2026 in Geneva. Her talk, titled "The Silicon Field: Merging
      High-Tech Sensors with Generational Farming Intuition," addresses the core friction point in modern
      agricultural policy. The summit gathers over 5,000 policymakers, technologists, and agronomists to set
      the agenda for the next decade of food security under the shadow of accelerated climate change.
      Key priorities include finalizing the global framework for carbon-credit tracking in small-to-medium
      farming co-ops, standardizing open-source data layers for soil moisture analytics, and creating
      equitable funding structures for the Global South.
    `),
  },
  {
    title: 'New EU Horizon Funding Approved',
    slug: 'new-eu-horizon-funding-approved',
    date: '2026-02-15',
    summary:
      'RuralNexus successfully secured €4.2M to lead Project GreenRoots, a multi-national initiative spanning 5 countries over 4 years.',
    category: 'Funding',
    isHighlight: true,
    content: makeRichText(`
      After a rigorous 18-month proposal phase managed by our PA1 (Project Acquisition) node, the European
      Commission has officially awarded Project GreenRoots the Horizon 2026 grant. This €4.2M initiative will
      fund active living labs across Italy, Spain, France, Greece, and Portugal. The focus is specifically on
      developing drought-resistant crop rotation methodologies that do not rely heavily on synthetic
      petroleum-based fertilizers. Recruitment for 12 new early-career fellowships will begin next month
      in coordination with PA4.
    `),
  },
  {
    title: 'Publication: Resilience in Farming Networks',
    slug: 'publication-resilience-in-farming-networks',
    date: '2026-04-12',
    summary:
      'Our transdisciplinary team published a 40-page open-access paper detailing the correlation between biodiversity and economic stability in regional cooperatives.',
    category: 'Publication',
    isHighlight: true,
    content: makeRichText(`
      Can biodiversity actually protect farmers from macroeconomic shocks? According to our latest publication
      in the Journal of Agronomic Economics, the answer is a resounding yes. Led by the PA3 Transdisciplinary
      Research team, this study analyzed 400 regional cooperatives over a 10-year period. It found that farms
      utilizing complex crop rotation and maintaining at least 15% wild biodiversity margins suffered 40% less
      revenue volatility during bad weather events compared to monoculture counterparts.
    `),
  },
  {
    title: 'Workshop: Modern Soil Conservation',
    slug: 'workshop-modern-soil-conservation',
    date: '2026-03-04',
    summary:
      'A hands-on methodology workshop for regional extension workers led by PA4 Capacity Building team.',
    category: 'Workshop',
    isHighlight: false,
    content: makeRichText(
      'A successful three-day intensive analyzing the latest mechanical and biological methods for preventing topsoil erosion. Participants from 14 regional extension networks joined PA4 facilitators at our field hub to work through case studies and practical soil sampling protocols.',
    ),
  },
  {
    title: 'Field Report: Drone Mapping in the Alps',
    slug: 'field-report-drone-mapping-in-the-alps',
    date: '2026-05-18',
    summary:
      'Testing low-cost multispectral drones to identify early blight onset in high-altitude potato crops.',
    category: 'Field Report',
    isHighlight: false,
    content: makeRichText(
      'Our PA3 team spent two weeks above 1500m testing consumer-grade drones modified with open-source multi-spectral cameras. Early results indicate detection of blight signatures 11–14 days before visual symptoms appear, giving farmers a critical intervention window without expensive aerial survey contracts.',
    ),
  },
  {
    title: 'Policy Advisory: Water Rights 2030',
    slug: 'policy-advisory-water-rights-2030',
    date: '2026-06-22',
    summary:
      'RuralNexus delivered a critical whitepaper to the regional agricultural ministry regarding impending water scarcity.',
    category: 'Policy',
    isHighlight: false,
    content: makeRichText(
      'Drafted by the PA5 Consultancy team, this whitepaper outlines 5 immediate legislative actions required to secure equitable water distribution in drought-prone agricultural zones. It draws on field data from three seasons of monitoring across 8 sub-catchments and aligns with EU Water Framework Directive targets.',
    ),
  },
  {
    title: 'Funding: Local Innovators Grant Launched',
    slug: 'funding-local-innovators-grant-launched',
    date: '2026-07-10',
    summary:
      'We are accepting micro-grant applications from local tech-forward farming cooperatives.',
    category: 'Funding',
    isHighlight: false,
    content: makeRichText(
      'In partnership with the Global Green Fund, we are disseminating €500,000 in micro-grants to farming cooperatives that are piloting technology-driven sustainability practices. Applications are open to cooperatives in our partner regions with active membership of 20 or more farming households.',
    ),
  },
  {
    title: 'Publication: AI in Yield Prediction',
    slug: 'publication-ai-in-yield-prediction',
    date: '2026-08-05',
    summary:
      'A critical review of the current AI models used by large agribusinesses and their inherent biases against small-holders.',
    category: 'Publication',
    isHighlight: false,
    content: makeRichText(
      'Machine learning models require data. Small farmers do not have organized data. The result is AI that optimizes for mega-farms while small-holders are left with recommendations that do not reflect their reality. This review, published in the Journal of Rural Technology Ethics, calls for community-embedded data collection protocols as a prerequisite for equitable AI deployment in agriculture.',
    ),
  },
]

export async function seed(payload: Payload) {
  for (const item of newsEvents) {
    const existing = await payload.find({
      collection: 'news-events',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed:news-events] skip — already exists: ${item.slug}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'news-events', data: item as any })
    payload.logger.info(`[seed:news-events] created: ${item.slug}`)
  }

  payload.logger.info('[seed:news-events] done')
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
