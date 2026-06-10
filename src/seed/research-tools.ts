import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const tools = [
  { title: 'QAToCA Tool', description: 'Qualitative Analysis Tool for Capacity Assessment.', order: 1 },
  { title: 'OCATI Tool', description: 'Organisational Capacity Assessment Tool for Innovation.', order: 2 },
  { title: 'TRD Tools', description: 'Transdisciplinary Research Design tools and templates.', order: 3 },
  { title: 'AET', description: 'Agro-Ecological Transition assessment toolkit.', order: 4 },
  { title: 'AGRECO', description: 'Agro-economic modelling and resilience evaluation tool.', order: 5 },
  { title: 'SCALA', description: 'Scaling Climate-smart Agriculture and Land-use Approaches toolkit.', order: 6 },
]

/** Additive only: skips tools that already exist so admin edits aren't overwritten on re-run. */
export async function seed(payload: Payload) {
  for (const tool of tools) {
    const existing = await payload.find({
      collection: 'research-tools',
      where: { title: { equals: tool.title } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed:research-tools] exists, skipping: ${tool.title}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'research-tools', data: tool as any })
    payload.logger.info(`[seed:research-tools] created: ${tool.title}`)
  }

  payload.logger.info('[seed:research-tools] done')
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
