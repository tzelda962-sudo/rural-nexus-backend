# Phase 2 — Content Collections

All 9 content types from BACKEND_SPEC §5 + contact inquiry. Shape matches the frontend TypeScript interfaces 1:1 so Nuxt HTTP repositories can drop in without a mapping layer.

## Collections
- [x] `Programs` (PA1–PA5, SDG goals 1–17, nested initiatives)
- [x] `NewsEvents` (categories enum, `isHighlight`, Lexical rich text, image upload)
- [x] `Team` (self-relation `parent` for reporting line)
- [x] `FeaturedVolunteers`
- [x] `Stories` (`isFeatured` flag, Lexical body, image upload)
- [x] `Gallery` (category enum, year 1900–2100, required image upload)
- [x] `ImpactMetrics` (numeric value + suffix + label + description)
- [x] `HomepageTestimonials`
- [x] `VolunteerStats` (free-text value like "120+", label)
- [x] `ContactInquiries` (admin-only read; create blocked — must go through POST /api/contact)

## Payload config
- [x] Register all collections in `src/payload.config.ts`

## Media storage (S3 → Supabase)
- [x] User: create Supabase Storage bucket (public read)
- [x] `s3Storage` plugin wired in `payload.config.ts` — `forcePathStyle: true` for Supabase, creds from env
- [ ] User: Supabase → Storage → S3 Connection → generate access key → fill `.env`:
  - `S3_BUCKET`, `S3_ENDPOINT` (`https://<ref>.supabase.co/storage/v1/s3`), `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- [x] Upload test image via `/admin/collections/media` → confirm URL resolves from Supabase CDN
- [x] Confirm Media DB rows have `filename` + `url` but no local file on disk (`disableLocalStorage` is auto-set by the plugin)

## Verification
- [x] `npm run generate:types` includes types for every collection
- [x] Public GET `/api/programs`, `/api/news-events`, `/api/team`, `/api/featured-volunteers`, `/api/stories`, `/api/gallery`, `/api/impact-metrics`, `/api/homepage-testimonials`, `/api/volunteer-stats` all return `[]` or seeded data without auth
- [x] POST to `/api/contact-inquiries` returns 403 (only `POST /api/contact` endpoint — Phase 3 — is allowed to write)
