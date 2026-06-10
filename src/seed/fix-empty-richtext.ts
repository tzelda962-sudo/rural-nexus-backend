import type { Payload } from 'payload'
import { fileURLToPath } from 'url'
import { EMPTY_RICH_TEXT } from '../lib/richText'

const RICH_TEXT_FIELDS = ['longDescription', 'methodologySection'] as const

/** Backfills null/undefined richText fields on existing Programs docs with a valid empty
 *  Lexical document, fixing "setEditorState: the editor state is empty" (error #38) when
 *  opening these fields in the admin UI. Purely additive — only touches fields that are
 *  currently null/undefined, never overwrites existing content. */
export async function seed(payload: Payload) {
  const { docs } = await payload.find({ collection: 'programs', limit: 100, depth: 0 })

  for (const program of docs) {
    const patch: Record<string, unknown> = {}

    for (const field of RICH_TEXT_FIELDS) {
      const value = (program as Record<string, unknown>)[field]
      if (value === null || value === undefined) {
        patch[field] = EMPTY_RICH_TEXT
      }
    }

    const initiatives = (program as { initiatives?: Array<Record<string, unknown>> }).initiatives
    if (Array.isArray(initiatives)) {
      let initiativesChanged = false
      const patchedInitiatives = initiatives.map((init) => {
        if (init.longDescription === null || init.longDescription === undefined) {
          initiativesChanged = true
          return { ...init, longDescription: EMPTY_RICH_TEXT }
        }
        return init
      })
      if (initiativesChanged) patch.initiatives = patchedInitiatives
    }

    if (Object.keys(patch).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: 'programs', id: program.id as string, data: patch as any })
      payload.logger.info(`[seed:fix-empty-richtext] patched ${(program as { code?: string }).code}: ${Object.keys(patch).join(', ')}`)
    }
  }

  payload.logger.info('[seed:fix-empty-richtext] done')
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
