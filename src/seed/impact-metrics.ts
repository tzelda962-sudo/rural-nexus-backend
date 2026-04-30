import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const metrics = [
  {
    value: 12500,
    suffix: '+',
    label: 'Lives Impacted',
    description:
      'Direct fellows and regional beneficiaries reached through transdisciplinary nexus points.',
  },
  {
    value: 64,
    suffix: '',
    label: 'Active Nodes',
    description:
      'Context-specific research units operational across 12 strategic rural ecosystems.',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Transparency',
    description:
      'Every resource and allocation is tracked in our open intelligence ledger.',
  },
]

export async function seed(payload: Payload) {
  for (const metric of metrics) {
    const existing = await payload.find({
      collection: 'impact-metrics',
      where: { label: { equals: metric.label } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed:impact-metrics] skip — already exists: ${metric.label}`)
      continue
    }

    await payload.create({ collection: 'impact-metrics', data: metric })
    payload.logger.info(`[seed:impact-metrics] created: ${metric.label}`)
  }

  payload.logger.info('[seed:impact-metrics] done')
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
