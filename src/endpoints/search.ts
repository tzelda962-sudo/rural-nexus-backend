import type { Endpoint } from 'payload'

type SearchHit = {
  type: 'news-event' | 'story' | 'publication' | 'program'
  id: string | number
  title: string
  slug?: string | null
  summary?: string | null
  href: string
}

/**
 * GET /api/search?q=...&limit=10
 *
 * Consolidated search across NewsEvents, Stories, Publications, and Programs.
 * Matches against title + summary/description/excerpt using case-insensitive
 * `contains`. Returns grouped hits with a ready-to-use `href` per result.
 */
export const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? '', 'http://placeholder')
    const q = (url.searchParams.get('q') ?? '').trim()
    const limitParam = Number.parseInt(url.searchParams.get('limit') ?? '10', 10)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 25) : 10

    if (q.length < 2) {
      return Response.json({ query: q, hits: [], total: 0 }, { status: 200 })
    }

    try {
      const [news, stories, publications, programs] = await Promise.all([
        req.payload.find({
          collection: 'news-events',
          where: { or: [{ title: { contains: q } }, { summary: { contains: q } }] },
          limit,
          depth: 0,
        }),
        req.payload.find({
          collection: 'stories',
          where: { or: [{ title: { contains: q } }, { excerpt: { contains: q } }] },
          limit,
          depth: 0,
        }),
        req.payload.find({
          collection: 'publications',
          where: { or: [{ title: { contains: q } }, { summary: { contains: q } }] },
          limit,
          depth: 0,
        }),
        req.payload.find({
          collection: 'programs',
          where: { or: [{ title: { contains: q } }, { description: { contains: q } }] },
          limit,
          depth: 0,
        }),
      ])

      const hits: SearchHit[] = [
        ...news.docs.map<SearchHit>((d) => ({
          type: 'news-event',
          id: d.id,
          title: d.title,
          slug: (d as { slug?: string }).slug,
          summary: d.summary,
          href: `/news/${(d as { slug?: string }).slug ?? d.id}`,
        })),
        ...stories.docs.map<SearchHit>((d) => ({
          type: 'story',
          id: d.id,
          title: d.title,
          slug: (d as { slug?: string }).slug,
          summary: d.excerpt,
          href: `/stories/${(d as { slug?: string }).slug ?? d.id}`,
        })),
        ...publications.docs.map<SearchHit>((d) => ({
          type: 'publication',
          id: d.id,
          title: d.title,
          slug: d.slug,
          summary: d.summary,
          href: `/publications/${d.slug ?? d.id}`,
        })),
        ...programs.docs.map<SearchHit>((d) => ({
          type: 'program',
          id: d.id,
          title: d.title,
          slug: (d as { slug?: string }).slug,
          summary: d.description,
          href: `/programs/${(d as { slug?: string }).slug ?? d.id}`,
        })),
      ]

      return Response.json({ query: q, hits, total: hits.length }, { status: 200 })
    } catch (err) {
      req.payload.logger.error({ err, query: q }, 'search: query failed')
      return Response.json({ error: 'Internal error' }, { status: 500 })
    }
  },
}
