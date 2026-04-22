# Phase 4 — Deployment (Render + Hostinger DNS + UptimeRobot)

Production target: `https://api.ruralnexus.org` (Nuxt frontend will live at `https://ruralnexus.org`).

## Repository
- [x] Strip Next.js scaffold artifacts (`src/app/(frontend)`, `src/app/my-route`)
- [x] Untrack `legacy/` pre-pivot codebase (kept on disk, excluded from repo via `.gitignore`)
- [x] Initial commit + push to `https://github.com/tzelda962-sudo/rural-nexus-backend` (`main`)
- [x] Add `KumBrian` as collaborator on the GitHub repo (local git was authed as that account)

## Render service
- [x] `render.yaml` defines web service: Frankfurt, free plan, `healthCheckPath: /api/keep-alive`, `autoDeploy: true`
- [x] Fix build: `npm ci --include=dev` (NODE_ENV=production otherwise skips devDependencies Next.js needs)
- [x] Render blueprint connected, all env vars populated (prod values: `PAYLOAD_PUBLIC_SERVER_URL=https://api.ruralnexus.org`, `FRONTEND_URL=https://ruralnexus.org`)
- [x] First deploy green on `https://ruralnexus-cms.onrender.com`
- [x] Smoke test: `/api/keep-alive`, `/admin`, `/api/programs` all HTTP 200

## Custom domain
- [x] Render → Custom Domains → `api.ruralnexus.org`
- [x] Hostinger DNS: CNAME `api` → `ruralnexus-cms.onrender.com`
- [x] Hostinger DNS: delete conflicting default A record `api → 145.223.89.19`
- [x] DNS propagates, Render issues TLS cert (Google Trust Services, valid to Jul 20 2026)
- [x] Smoke test via custom domain: `https://api.ruralnexus.org/api/keep-alive` → `{ok:true,...}`

## CORS / CSRF
- [x] `payload.config.ts` parses comma-separated `FRONTEND_URL` → supports `https://ruralnexus.org,https://www.ruralnexus.org`

## UptimeRobot (keep-alive)
- [ ] User: create UptimeRobot account (free tier is enough — 50 monitors, 5-min interval)
- [ ] User: add HTTP(s) monitor — URL `https://api.ruralnexus.org/api/keep-alive`, interval 5 min
- [ ] User: configure email alert contact so outages ping you
- [ ] Reason: defeats Render free-tier 15-min sleep AND Supabase 7-day project auto-pause

## First admin user
- [ ] User: open `https://api.ruralnexus.org/admin` — first visit shows the signup form; create the root admin account

## Security follow-ups (important — credentials leaked to conversation transcript during debug)
- [ ] User: rotate Supabase S3 access key (Storage → S3 Connection → revoke + regenerate)
- [ ] User: rotate Supabase Postgres password (Project Settings → Database → Reset password)
- [ ] User: rotate Resend API key (Resend → API Keys → revoke + create new)
- [ ] User: update both local `.env` and Render env vars with the rotated values
