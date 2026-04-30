import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const partners = [
  // ── Europe ────────────────────────────────────────────────────────────
  {
    name: 'University of Hohenheim',
    abbreviation: 'Uni-Hohenheim',
    type: 'University',
    continent: 'Europe',
    country: 'Germany',
  },
  {
    name: 'Leibniz Centre for Agricultural Landscape Research',
    abbreviation: 'ZALF',
    type: 'Research Institute',
    continent: 'Europe',
    country: 'Germany',
  },
  {
    name: 'Humboldt University of Berlin',
    abbreviation: 'HU Berlin',
    type: 'University',
    continent: 'Europe',
    country: 'Germany',
  },
  {
    name: 'Wageningen Research',
    abbreviation: 'WR',
    type: 'Research Institute',
    continent: 'Europe',
    country: 'Netherlands',
  },
  {
    name: 'CIRAD – Agricultural Research for Development',
    abbreviation: 'CIRAD',
    type: 'Research Institute',
    continent: 'Europe',
    country: 'France',
  },
  {
    name: 'University of Natural Resources and Life Sciences Vienna',
    abbreviation: 'Uni-Boku',
    type: 'University',
    continent: 'Europe',
    country: 'Austria',
  },

  // ── Africa ────────────────────────────────────────────────────────────
  {
    name: 'University of Ghana',
    abbreviation: 'Uni-Accra',
    type: 'University',
    continent: 'Africa',
    country: 'Ghana',
  },
  {
    name: 'University of Buea',
    abbreviation: 'Uni-Buea',
    type: 'University',
    continent: 'Africa',
    country: 'Cameroon',
  },
  {
    name: 'International Institute of Tropical Agriculture',
    abbreviation: 'IITA',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Cameroon',
  },
  {
    name: 'Institute of Agricultural Research for Development',
    abbreviation: 'IRAD',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Cameroon',
  },
  {
    name: 'Rwanda Agriculture and Animal Resources Development Board',
    abbreviation: 'RAP',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Rwanda',
  },
  {
    name: "Institut des Sciences Agronomiques du Burundi",
    abbreviation: 'ISABU',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Burundi',
  },
  {
    name: 'University of Ouagadougou',
    abbreviation: 'Uni-Burkina',
    type: 'University',
    continent: 'Africa',
    country: 'Burkina Faso',
  },
  {
    name: "Institut de l'Environnement et de Recherches Agricoles",
    abbreviation: 'INERA',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Burkina Faso',
  },
  {
    name: 'African Forum for Agricultural Advisory Services',
    abbreviation: 'AFAAS',
    type: 'NGO',
    continent: 'Africa',
    country: 'Uganda',
  },
  {
    name: 'Initiative Prospective Agricole et Rurale',
    abbreviation: 'IPAR',
    type: 'Research Institute',
    continent: 'Africa',
    country: 'Senegal',
  },
]

export async function seed(payload: Payload) {
  for (const partner of partners) {
    const existing = await payload.find({
      collection: 'partners',
      where: { name: { equals: partner.name } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`[seed:partners] skip — already exists: ${partner.abbreviation}`)
      continue
    }

    await payload.create({ collection: 'partners', data: partner })
    payload.logger.info(`[seed:partners] created: ${partner.abbreviation} (${partner.country})`)
  }

  payload.logger.info('[seed:partners] done')
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
