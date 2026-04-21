# Phase 3 — Transactional Endpoints

Two custom endpoints registered via Payload's `endpoints` config array (served through Payload's catch-all at `/api/*`, no conflict with collection routes).

## GET /api/keep-alive
- [x] `src/endpoints/keepAlive.ts` — `payload.find({ collection: 'users', limit: 1 })` to touch the DB
- [x] Registered in `payload.config.ts`
- [x] Verify locally: `curl http://localhost:3000/api/keep-alive` → `{ ok: true, timestamp: ... }`
- [ ] Verify it counts as the Render health check (see `render.yaml`)
- [ ] Post-deploy: point UptimeRobot HTTP GET monitor at `https://api.ruralnexus.org/api/keep-alive` every 5 min

## POST /api/contact
- [x] `src/endpoints/contact.ts` — zod-validated body, persists to `contact-inquiries`, fires Resend email
- [x] `src/email/sendContactEmail.ts` — Resend client + HTML-escaped notification template
- [x] Collection `ContactInquiries` blocks public create; endpoint uses `overrideAccess: true`
- [x] Registered in `payload.config.ts`
- [ ] User: verify `ruralnexus.org` DNS access and set up Resend domain (DKIM/SPF TXT records)
- [ ] User: fill `.env` with `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (must be on verified domain), `ADMIN_EMAIL`
- [x] Verify locally: `curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"firstName":"Test","lastName":"User","email":"test@example.com","interestArea":"Partnership","message":"Hello, this is a test inquiry over ten chars"}'`
- [ ] Confirm row appears in `/admin/collections/contact-inquiries` and email lands at `ADMIN_EMAIL`

## Notes
- Email sending failures are logged but do NOT fail the request — the inquiry is still persisted so we never lose a submission.
- `replyTo` on the email is the submitter's address, so admins can reply directly from their inbox.
