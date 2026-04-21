# Phase 1 — Payload Core & Auth

Wire Payload against Supabase, run first migration, log in to `/admin`, enforce admin/editor roles.

## Users collection & access
- [x] `src/access/isAdmin.ts`
- [x] `src/access/isAdminOrEditor.ts`
- [x] `src/access/isAnyone.ts`
- [x] `src/collections/Users.ts` — add `role` (admin|editor), `name`, default role `editor`, only admins can manage users
- [x] `src/collections/Media.ts` — public read, admin/editor write, image mime-type guard

## Supabase + local boot (blocked on user)
- [x] User: create Supabase project
- [x] User: copy pooled connection string (port 6543, user `postgres.<project_ref>`) → `.env` `DATABASE_URL`
- [x] User: generate `PAYLOAD_SECRET` via `openssl rand -base64 48` → `.env`
- [x] `npm install` — Payload 3.83.0, postgres adapter, sharp, resend
- [x] `npm run dev` — Next boots on :3000, Postgres connection alive
- [ ] Visit `/admin` — first-boot wizard creates first admin user
- [ ] Verify `DATABASE_URL` pooled connection holds under reload

## Verification
- [ ] Schema auto-pushed to Supabase (check `_payload_migrations`, `users` tables)
- [ ] Admin user can log in; editor account cannot reach `/admin/collections/users`
- [ ] `npm run generate:types` produces `src/payload-types.ts`
