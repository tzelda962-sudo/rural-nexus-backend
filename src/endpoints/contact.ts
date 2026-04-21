import type { Endpoint } from 'payload'
import { z } from 'zod'
import { sendContactEmail } from '../email/sendContactEmail'

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  organization: z.string().trim().max(200).optional(),
  interestArea: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(5000),
})

/**
 * POST /api/contact
 *
 * Public submission endpoint for the contact form.
 * Validates → persists to `contact-inquiries` → emails ADMIN_EMAIL via Resend.
 * The collection itself has `create: () => false`, so this endpoint is the only write path.
 */
export const contactEndpoint: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async (req) => {
    let body: unknown
    try {
      body = await req.json?.()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data

    try {
      const doc = await req.payload.create({
        collection: 'contact-inquiries',
        data,
        overrideAccess: true,
      })

      try {
        await sendContactEmail(data)
      } catch (emailErr) {
        req.payload.logger.error(
          { err: emailErr, inquiryId: doc.id },
          'contact: inquiry saved but email notification failed',
        )
      }

      return Response.json({ ok: true, id: doc.id }, { status: 201 })
    } catch (err) {
      req.payload.logger.error({ err }, 'contact: failed to persist inquiry')
      return Response.json({ error: 'Internal error' }, { status: 500 })
    }
  },
}
