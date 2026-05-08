import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const homePageData = {
  hero: {
    eyebrowTags: [
      { value: 'Action Research' },
      { value: 'Sustainable Innovation' },
      { value: 'Development' },
      { value: 'Food Systems' },
    ],
    headlineLine1: 'Transformative action research for',
    headlineEmphasis: 'sustainable innovations',
    headlineLine2: 'from projects to impact',
    subtitle:
      'Advancing UN sustainable development goals through collaborative field-based research, strategic partnerships, and resilient food systems design.',
    primaryCta: { label: 'Explore Our Programs', path: '/programs' },
    secondaryCta: { label: 'Who We Are', path: '/about' },
  },
  whoWeAre: {
    eyebrow: 'Global Identity',
    headingLine1: 'Who We Are:',
    headingLine2Prefix: 'An',
    headingLine2Emphasis: 'International Network',
    headingLine2Suffix: 'of Excellence',
    body: 'RuralNexus is a decentralized ecosystem of researchers, agronomists, and project managers dedicated to closing the theory-to-practice gap with evidence-led rural development.',
    stats: [
      { value: '240+', label: 'Research Fellows' },
      { value: '12', label: 'Field Hubs' },
      { value: '8', label: 'Countries of Intervention' },
    ],
    ctaLabel: 'Meet the Leadership',
    ctaPath: '/about',
    floatingBadge: {
      title: 'Scientific Rigor',
      body: 'Our transdisciplinary methodology is strictly mapped to UN SDG frameworks.',
    },
  },
  testimonialsSection: {
    heading: 'What partners say about RuralNexus',
  },
  newsSection: {
    heading: 'Latest field reports and research updates',
    latestEventsCount: 3,
    highlightsCount: 2,
  },
  missionSdgSection: {
    heading: 'Driving outcomes at the UN SDG frontier',
    body: 'Every programmatic area within our operational hub is aligned to United Nations Sustainable Development Goals, ensuring our interventions deliver measurable and accountable impact.',
    ctaLabel: 'Read our 2026 Impact Report →',
    ctaPath: '/research',
    featuredSdgs: [{ goal: 1 }, { goal: 2 }, { goal: 4 }, { goal: 8 }, { goal: 13 }, { goal: 15 }],
  },
  partnersSection: {
    heading: 'Trusted by global research and development partners',
  },
}

export async function seed(payload: Payload) {
  const existing = await payload.findGlobal({ slug: 'home-page' })

  if (!existing) {
    payload.logger.info('[seed:homepage] no home-page global found')
    return
  }

  await payload.updateGlobal({ slug: 'home-page', data: homePageData })
  payload.logger.info('[seed:homepage] updated home-page global content')
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
