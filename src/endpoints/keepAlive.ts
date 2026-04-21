import type { Endpoint } from 'payload'

/**
 * GET /api/keep-alive
 *
 * Hit by UptimeRobot every 5 minutes. Runs a trivial query so both Render (15-min sleep)
 * and Supabase (7-day pause on free tier) register activity.
 */
export const keepAliveEndpoint: Endpoint = {
  path: '/keep-alive',
  method: 'get',
  handler: async (req) => {
    try {
      await req.payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
        pagination: false,
      })
      return Response.json({ ok: true, timestamp: new Date().toISOString() })
    } catch (err) {
      req.payload.logger.error({ err }, 'keep-alive: database ping failed')
      return Response.json({ ok: false }, { status: 503 })
    }
  },
}
