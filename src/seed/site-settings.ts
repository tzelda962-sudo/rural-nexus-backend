import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const interventionCountries = [
  {
    name: 'Cameroon',
    isoCode: 'CM',
    programs: 'Field research, public health agriculture, and extension services.',
  },
  {
    name: 'Ghana',
    isoCode: 'GH',
    programs: 'Agroecology studies, food systems resilience, and farmer-led innovation.',
  },
  {
    name: 'Uganda',
    isoCode: 'UG',
    programs: 'Community adaptation research and climate-smart agriculture pilots.',
  },
  {
    name: 'Senegal',
    isoCode: 'SN',
    programs: 'Participatory water management and nutrition security programming.',
  },
  {
    name: 'Rwanda',
    isoCode: 'RW',
    programs: 'Integrated landscape research, market access, and rural livelihoods.',
  },
  {
    name: 'Burkina Faso',
    isoCode: 'BF',
    programs: 'Dryland resilience research, soil health, and farmer network support.',
  },
  {
    name: 'Burundi',
    isoCode: 'BI',
    programs: 'Smallholder knowledge exchange and sustainable farming research.',
  },
  {
    name: 'Ethiopia',
    isoCode: 'ET',
    programs: 'Inclusive food systems innovation and climate-smart field trials.',
  },
]

export async function seed(payload: Payload) {
  const existing = await payload.findGlobal({ slug: 'site-settings' })

  if (!existing) {
    console.log('[seed:site-settings] no site-settings global found')
    return
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: { interventionCountries, _status: 'published' },
  })
  console.log('[seed:site-settings] updated site-settings intervention countries')
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
