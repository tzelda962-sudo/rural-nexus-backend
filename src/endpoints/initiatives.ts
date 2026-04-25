import type { Endpoint } from 'payload'

type Initiative = {
  title: string
  slug: string
  description: string
  location?: string | null
  status?: string | null
  stat?: string | null
  icon?: string | null
  heroImage?: unknown
  longDescription?: unknown
  showInProjectsTab?: boolean | null
}

/**
 * GET /api/initiatives
 *
 * Flattens every `initiatives` item across all Programs into a single list,
 * filtered by `?showcase=true` to surface only items admins marked for the
 * Action Hub Projects tab. Each row is returned with its parent program's
 * title, slug, code, and color for card rendering.
 */
export const listInitiativesEndpoint: Endpoint = {
  path: '/initiatives',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? '', 'http://placeholder')
    const showcaseOnly = url.searchParams.get('showcase') === 'true'

    try {
      const programs = await req.payload.find({
        collection: 'programs',
        limit: 1000,
        depth: 1,
        overrideAccess: false,
        user: req.user,
      })

      const flattened = programs.docs.flatMap((program) => {
        const initiatives = (program.initiatives ?? []) as Initiative[]
        return initiatives
          .filter((i) => (showcaseOnly ? i.showInProjectsTab !== false : true))
          .map((i) => ({
            ...i,
            program: {
              id: program.id,
              title: program.title,
              slug: (program as { slug?: string }).slug,
              code: program.code,
              color: program.color,
            },
          }))
      })

      return Response.json({ docs: flattened, totalDocs: flattened.length }, { status: 200 })
    } catch (err) {
      req.payload.logger.error({ err }, 'initiatives: list failed')
      return Response.json({ error: 'Internal error' }, { status: 500 })
    }
  },
}

/**
 * GET /api/initiatives/:programSlug/:initiativeSlug
 *
 * Returns a single initiative with its parent program context, for the
 * initiative detail page.
 */
export const getInitiativeEndpoint: Endpoint = {
  path: '/initiatives/:programSlug/:initiativeSlug',
  method: 'get',
  handler: async (req) => {
    const { programSlug, initiativeSlug } = (req.routeParams ?? {}) as {
      programSlug?: string
      initiativeSlug?: string
    }

    if (!programSlug || !initiativeSlug) {
      return Response.json({ error: 'Missing slug parameters' }, { status: 400 })
    }

    try {
      const res = await req.payload.find({
        collection: 'programs',
        where: { slug: { equals: programSlug } },
        limit: 1,
        depth: 2,
        overrideAccess: false,
        user: req.user,
      })

      const program = res.docs[0]
      if (!program) return Response.json({ error: 'Program not found' }, { status: 404 })

      const initiative = ((program.initiatives ?? []) as Initiative[]).find(
        (i) => i.slug === initiativeSlug,
      )
      if (!initiative)
        return Response.json({ error: 'Initiative not found' }, { status: 404 })

      return Response.json(
        {
          ...initiative,
          program: {
            id: program.id,
            title: program.title,
            slug: (program as { slug?: string }).slug,
            code: program.code,
            color: program.color,
          },
        },
        { status: 200 },
      )
    } catch (err) {
      req.payload.logger.error({ err }, 'initiatives: get failed')
      return Response.json({ error: 'Internal error' }, { status: 500 })
    }
  },
}
