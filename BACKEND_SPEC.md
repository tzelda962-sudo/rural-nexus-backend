# RuralNexus NGO Website — Backend Integration Specification

**Project:** RuralNexus NGO Website  
**Frontend Stack:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, Bun  
**Architecture:** Hexagonal (Ports & Adapters) — domain, application, infrastructure, and presentation layers  
**Date:** 2026-04-20  

---

## 1. Overview

The frontend is a fully designed Nuxt 4 application. All data is currently served by in-memory mock repositories located in `src/infrastructure/`. The backend agent's job is to:

1. Provide a REST (or GraphQL) API that the frontend can swap in for the mocks.
2. Stand up a CMS so non-technical admins can manage content without touching code.
3. Handle transactional operations: contact form emails.

The frontend already uses a clean hexagonal architecture — each mock repository implements a TypeScript interface (port). Backend integration means providing concrete HTTP-based repository implementations that satisfy those same interfaces.

---

## 2. What Stays Purely Frontend (No Backend Needed)

The following are UI-only features. Do not build backend for these.

| Feature | Reason |
|---|---|
| Header navigation dropdowns & mobile drawer | Pure navigation UI state |
| Events page tab switching (Projects / Publications / News) | Client-side tab state |
| Gallery category filter | Client-side computed filtering |
| Research page search & category filter | Client-side computed filtering |
| Org Explorer search & tree traversal | Client-side logic over fetched data |
| Impact Metrics animated counters | UI animation triggered by IntersectionObserver |
| Donation form (entire feature) | Out of scope for this phase |
| Volunteer application form (entire feature) | Out of scope for this phase |
| Dark/light mode or accessibility toggles (if any) | UI preference stored in localStorage |

---

## 3. What Needs Backend Integration

### 3.1 Content (CMS-Managed)

All content below must be manageable by a non-technical client through an admin dashboard.

| Content Type | Current Mock File | CRUD Operations | Notes |
|---|---|---|---|
| News & Events (articles) | `MockNewsEventRepository.ts` | Full CRUD | Includes rich HTML body, categories, image uploads |
| Programs (PA1–PA5) | `MockProgramAreaRepository.ts` | Full CRUD | Each program has SDG mappings and nested initiatives |
| Team Members | `MockTeamRepository.ts` | Full CRUD | Hierarchical (parentId FK), avatar uploads |
| Featured Volunteer Testimonials | `MockVolunteerRepository.ts` | Full CRUD | Curated subset of volunteers; manually featured by admin |
| Success Stories | Hardcoded in `stories.vue` | Full CRUD | Featured flag, category, rich body |
| Gallery Items | Hardcoded in `gallery.vue` | Full CRUD | Image upload, category, location, year |
| Homepage Testimonials | Hardcoded in `index.vue` | Full CRUD | Author, quote, company |
| Impact Metrics | Hardcoded in `ImpactMetrics.vue` | Full CRUD | Numeric value, suffix, label, description |
| Volunteer Statistics | Hardcoded in `volunteer.vue` | Update only | 4 stat counters: value + label (display only; no application submission) |

### 3.2 Transactional / Form Submissions

| Feature | Current Behavior | Backend Requirement |
|---|---|---|
| Contact Inquiry Form | Fake 1.2s delay → success state | Persist to DB, send email notification to org admin |

### 3.3 Media / File Uploads

Gallery and Story images are currently gradient placeholders. Admin CMS must support image uploads with CDN delivery (e.g., Cloudinary, Vercel Blob, or S3).

---

## 4. CMS Recommendation

**Recommended: Payload CMS** (self-hosted, TypeScript-native)

Rationale:
- TypeScript-first — aligns with the existing frontend types.
- Built-in admin UI that non-technical clients can use without writing code.
- REST and GraphQL API auto-generated from collection schemas.
- Rich text / Lexical editor for article body content.
- Image upload with focal point and CDN plugin support.
- Role-based access control (admin vs. editor).
- Can be deployed alongside the frontend or separately.

Alternative: **Directus** (good choice if the team prefers a more visual no-code CMS approach over code-first config).

Both options require a PostgreSQL (or SQLite for small deployments) database.

---

## 5. Data Models

All TypeScript interfaces below come directly from the existing domain layer. The backend should store and return data conforming to these shapes.

### 5.1 NewsEvent

```typescript
interface NewsEvent {
  id: string;
  title: string;
  date: string;          // "DD.MM.YYYY" display format
  summary: string;
  category: "Publication" | "Field Report" | "Workshop" | "Funding" | "Policy" | "News";
  isHighlight: boolean;  // featured on homepage
  contentHTML: string;   // rich text body for article detail page
  imageUrl?: string;
}
```

### 5.2 ProgramArea

```typescript
interface Initiative {
  title: string;
  description: string;
}

interface ProgramArea {
  id: string;
  code: string;          // "PA1", "PA2", etc.
  title: string;
  description: string;
  color: string;         // Tailwind color name (e.g., "cyan")
  sdgs: number[];        // UN SDG goal numbers (1–17)
  initiatives: Initiative[];
}
```

### 5.3 TeamMember

```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  parentId: string | null;   // null = root (Director)
  bio: string;
  expertise: string[];
  avatarUrl?: string;
}
```

### 5.4 FeaturedVolunteer

```typescript
interface FeaturedVolunteer {
  id: string;
  name: string;
  role: string;
  location: string;
  since: string;         // e.g., "March 2022"
  quote: string;
  program: string;       // program area code or name
  initials: string;      // fallback avatar text
  gradient: string;      // Tailwind gradient class for avatar bg
}
```

### 5.5 Story

```typescript
interface Story {
  id: string;
  title: string;
  excerpt: string;
  location: string;
  program: string;
  readTime: string;      // e.g., "5 min read"
  date: string;
  isFeatured: boolean;
  category: string;
  imageUrl?: string;
  contentHTML?: string;
}
```

### 5.6 GalleryItem

```typescript
interface GalleryItem {
  id: string;
  title: string;
  category: "Field Work" | "Community" | "Research" | "Events" | "Partners" | "All";
  location: string;
  year: number;
  imageUrl: string;
  caption?: string;
}
```

### 5.7 ImpactMetric

```typescript
interface ImpactMetric {
  id: string;
  value: number;
  suffix: string;        // e.g., "+", "%", "K"
  label: string;
  description: string;
}
```

### 5.8 HomepageTestimonial

```typescript
interface Testimonial {
  id: string;
  author: string;
  role: string;
  organization?: string;
  quote: string;
  avatarUrl?: string;
}
```

### 5.9 ContactInquiry (write-only, no frontend read)

```typescript
interface ContactInquiryPayload {
  firstName: string;
  lastName: string;
  organization?: string;
  interestArea: string;
  message: string;
}
```

---

## 6. Required API Endpoints

Base path: `/api/v1`

### 6.1 Programs

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/programs` | List all program areas | None |
| GET | `/programs/:id` | Get single program area | None |
| POST | `/programs` | Create program area | Admin |
| PUT | `/programs/:id` | Update program area | Admin |
| DELETE | `/programs/:id` | Delete program area | Admin |

### 6.2 News & Events

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/events` | List events with optional `?limit=N&category=X&highlight=true` | None |
| GET | `/events/:id` | Get single event with related articles | None |
| POST | `/events` | Create event/article | Admin |
| PUT | `/events/:id` | Update event/article | Admin |
| DELETE | `/events/:id` | Delete event/article | Admin |

Query params for `GET /events`:
- `limit` — number of items to return (default 20)
- `category` — filter by category string
- `highlight` — `true` returns only `isHighlight: true` items

### 6.3 Team

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/team` | List all team members (flat array; frontend builds tree) | None |
| GET | `/team/:id` | Get single team member | None |
| POST | `/team` | Create team member | Admin |
| PUT | `/team/:id` | Update team member | Admin |
| DELETE | `/team/:id` | Delete team member | Admin |

### 6.4 Volunteers

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/volunteers/featured` | List featured volunteer testimonials | None |

> Application submission is out of scope for this phase.

### 6.5 Stories

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/stories` | List stories with optional `?featured=true&category=X&limit=N` | None |
| GET | `/stories/:id` | Get single story | None |
| POST | `/stories` | Create story | Admin |
| PUT | `/stories/:id` | Update story | Admin |
| DELETE | `/stories/:id` | Delete story | Admin |

### 6.6 Gallery

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/gallery` | List gallery items with optional `?category=X` | None |
| POST | `/gallery` | Upload new gallery item (multipart form) | Admin |
| PUT | `/gallery/:id` | Update gallery item | Admin |
| DELETE | `/gallery/:id` | Delete gallery item | Admin |

### 6.7 Site Content (CMS Managed Singletons)

These are singleton records (one per type, updated by admin, never deleted).

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/content/impact-metrics` | List impact metric cards | None |
| PUT | `/content/impact-metrics/:id` | Update single metric | Admin |
| GET | `/content/testimonials` | List homepage testimonials | None |
| POST | `/content/testimonials` | Add testimonial | Admin |
| PUT | `/content/testimonials/:id` | Update testimonial | Admin |
| DELETE | `/content/testimonials/:id` | Delete testimonial | Admin |
| GET | `/content/volunteer-stats` | List volunteer stat counters | None |
| PUT | `/content/volunteer-stats/:id` | Update stat counter | Admin |

### 6.8 Contact

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/contact` | Submit contact inquiry | None |

On submit: persist record to DB, send email to configured admin address via SMTP or transactional email provider (Resend recommended).

### 6.9 Media Upload (shared)

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/media/upload` | Upload image, return CDN URL | Admin |
| DELETE | `/media/:key` | Delete uploaded media | Admin |

---

## 7. Authentication & Authorization

The admin CMS dashboard requires authentication. Public API routes (all `GET` endpoints and form submission `POST`s) require no authentication.

**Recommended Approach:**
- JWT-based auth for the REST API (admin routes protected by `Authorization: Bearer <token>` header).
- Payload CMS or Directus handles admin login natively with email + password.
- No public user accounts needed (no member login on the website).

**Roles:**
- `admin` — full CRUD access, can access all admin endpoints.
- `editor` — can create/update content but not delete or manage users.

---

## 8. Email Notifications

Trigger emails on these events:

| Trigger | Recipients | Template |
|---|---|---|
| Contact form submitted | Admin (configured env var) | Inquiry details, reply-to set to submitter's email |

**Recommended Provider:** [Resend](https://resend.com) (developer-friendly, generous free tier, good deliverability).

---

## 9. Frontend Integration Points

The frontend infrastructure layer lives at `src/infrastructure/`. Each mock repository file is a drop-in replacement point.

| Mock File | Replace With |
|---|---|
| `MockProgramAreaRepository.ts` | `HttpProgramAreaRepository.ts` — calls `/api/v1/programs` |
| `MockNewsEventRepository.ts` | `HttpNewsEventRepository.ts` — calls `/api/v1/events` |
| `MockTeamRepository.ts` | `HttpTeamRepository.ts` — calls `/api/v1/team` |
| `MockVolunteerRepository.ts` | `HttpVolunteerRepository.ts` — calls `/api/v1/volunteers/featured` (read-only for now) |

The application-layer use cases (`src/application/`) and domain interfaces (`src/domain/`) do not need to change. Only the infrastructure implementations are swapped.

Nuxt's `useAsyncData` composables are already in place on the screens — they will automatically benefit from SSR/caching once real endpoints are provided.

---

## 10. Environment Variables Required

The frontend will need these variables (add to `.env`):

```env
# Backend API
NUXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com/api/v1
```

The backend will need:

```env
# Database
DATABASE_URL=postgresql://...

# Email
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@ruralnexus.org

# JWT
JWT_SECRET=...
JWT_EXPIRY=7d

# Media/CDN
CLOUDINARY_URL=cloudinary://...  # or equivalent
```

---

## 11. Deployment Topology

```
┌─────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                  │
│  Nuxt 4 app (SSR)                                    │
│  → calls NUXT_PUBLIC_API_BASE_URL for all data       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│             Backend Server (Node.js)                 │
│  Payload CMS  +  REST API                            │
│  └── PostgreSQL DB                                   │
│  └── Media uploads → Cloudinary / Vercel Blob        │
└─────────────────────────────────────────────────────┘
```

Suggested backend hosting: Railway, Render, or a VPS (DigitalOcean). Payload CMS runs as a Node.js server.

---

## 12. Priority Order (Suggested Implementation Sequence)

1. **Payload CMS setup** — database, admin login, basic collections
2. **Programs & News/Events collections** — highest visibility content
3. **Team collection** — for the Org Explorer
4. **Stories & Gallery collections** — editorial content
5. **HTTP repository implementations** on frontend — replace all mocks
6. **Contact form** — DB persistence + email notification via Resend
7. **Singleton content** — impact metrics, testimonials, volunteer stats, featured volunteers
8. **Media upload pipeline** — CDN for real images across all collections

---

## 13. Out of Scope (Future Phase)

- Donation processing (Stripe integration, donor records)
- Volunteer application submission (form + email flow)
- User accounts / member portal
- Advanced analytics / reporting dashboard
- Newsletter subscription (subscribe flow not yet designed in the frontend)
- Multi-language / i18n support
- Event registration with ticket/RSVP management
