# Phase 0 — Pivot Setup

Rip out the old Fastify hexagonal monolith, scaffold Payload CMS 3 on Next.js, point it at Supabase, wire deployment for Render.

## Archive prior stack
- [x] `src/` → `legacy/src/`
- [x] `test/` → `legacy/test/`
- [x] `ngo-backend.md` → `legacy/ngo-backend.md`
- [x] `Dockerfile`, `docker-compose.yml`, `render.yaml`, `vitest.config.ts`, `tsconfig.build.json`, `package-lock.json` → `legacy/`
- [x] `.env`, `.env.example`, `package.json`, `tsconfig.json` → `legacy/`
- [x] `tasks/phase-0..6-*.md` → `tasks/legacy/`
- [x] Delete old `node_modules/` and `dist/`

## Scaffold Payload CMS 3 (blank template, Next.js 16.2, React 19.2)
- [x] `npx create-payload-app -t blank` → flattened into project root
- [x] Archive unused scaffold bits (playwright, vitest, docker, tests) to `legacy/scaffold-unused/`
- [x] `package.json` — swap mongo for postgres, pin Payload 3.83.0, add `@payloadcms/storage-s3` + `resend` + `zod`, drop playwright/vitest deps
- [x] `src/payload.config.ts` — swap `mongooseAdapter` → `postgresAdapter`, add `cors` + `csrf` from `FRONTEND_URL`, keep Users + Media
- [ ] `src/collections/Media.ts` — configure S3 storage adapter pointing at Supabase Storage (deferred to Phase 2)
- [x] `.env.example` — Supabase pooled URL, Payload secret, Resend, CORS, S3

## Deployment config
- [x] `render.yaml` — single web service, free plan, Frankfurt, build `npm ci && npm run build`, start `npm start`, health check on `/api/keep-alive`
- [ ] `render.yaml` — add `DATABASE_URL` via Render's external Postgres (no Render-managed DB; Supabase is the DB)

## Verification (next session)
- [ ] `npm install` succeeds
- [ ] Local `.env` filled with Supabase pooled URL + PAYLOAD_SECRET
- [ ] `npm run dev` boots, `/admin` serves Payload login
- [ ] First-boot admin user creation works
- [ ] `npm run build` succeeds on Node 20+
