# Phase 5 — Content Architecture & Frontend Integration

Catalog of every editable string/image on every page in `src_copy/presentation/screens/`, mapped to Payload Globals, Collections, and new detail-page routes. Every current placeholder becomes the **default value** of its Payload field, so the site renders identically to today's mockup until an admin changes anything.

---

## 1. Approach

- **Globals per page** — each page maps to one Payload Global. Layout is locked (admins can't re-order sections, which protects the design). Every string/image inside each section is a field.
- **Collections** for repeating content (already built: Programs, NewsEvents, Stories, Gallery, Team, FeaturedVolunteers, ImpactMetrics, HomepageTestimonials, VolunteerStats). Will extend each to support detail-page fields.
- **New collections** needed: `Publications` (see §10).
- **Live Preview** enabled on every global/collection for in-CMS visual editing.
- **Drafts + Versions** enabled everywhere so admins can work in progress and roll back.

---

## 2. Decisions (locked 2026-04-22)

1. **`/donate` page** — **REMOVE entirely.** Delete `donate.vue`, remove from nav/footer if referenced.

2. **Programs vs. Projects** — **MERGED into `ProgramArea.initiatives`.** Extend the existing `initiatives` array on the Programs collection with: `location` (text), `status` (enum: Active, Planning, Completed), `stat` (text, e.g. "12 villages, 4.5M L/yr"), `iconEnum` (reuse site icon enum), `slug` (for detail pages). The events.vue "Projects" tab becomes a flattened view of every initiative across all programs. No separate `ProjectShowcase` collection needed.

3. **Publications** — **ADD new `Publications` collection** (see §10). Fields: title, author, category enum, publishedDate, summary, abstract (Lexical), pdf (upload), slug.

4. **Volunteer applications** — **REMOVED from scope.** No `VolunteerApplications` collection, no `POST /api/volunteer` endpoint. `volunteer.vue` form becomes display-only or is removed (see §13).

5. **Detail-page URLs** — **Slug-based.** Every collection with a detail page gets a `slug` field auto-derived from title, editable, unique. Routes: `/programs/[slug]`, `/programs/[slug]/initiatives/[initiativeSlug]`, `/stories/[slug]`, `/publications/[slug]`, `/news/[slug]`.

6. **Search** — **WIRE IT UP.** Header search icon opens a dialog that queries Payload across NewsEvents, Stories, Publications, ProgramAreas (by title + summary/description). Backend: one consolidated endpoint `GET /api/search?q=...` that fans out to each collection and returns typed results.

---

## 3. SiteSettings (Global, singleton)

Controls chrome that appears on every page: header nav, footer, contact info, global CTAs, logo.

### Fields
- `brand.name` — text, default `"RuralNexus"`
- `brand.logoLetter` — text(max 2), default `"R"` (used in hex-mask logo)
- `brand.logoImage` — upload(Media), optional — if present, replaces letter logo
- `brand.tagline` — text, default `"Empowering Rural Resilience. Action Research, Innovation, and Development for resilient food systems."` (used in footer brand column)

- `navigation.primaryLinks` — array of `{ label, path, children?: array<{ label, path, description, icon }> }`
  - Default (Volunteer removed per §13, Donate removed per §16):
    - Home → `/`
    - Who We Are (dropdown) → Overview `/about` "Our mission & vision" (icon: Info), Impact Metrics `/impact` "Measurable outcomes" (icon: BarChart3), Field Stories `/stories` "Voices from the ground" (icon: MessageSquareQuote)
    - What We Do (dropdown) → Our Programs `/programs` "Core strategic pillars" (icon: Layers), Action Hub `/events` "Projects & Publications" (icon: Rocket), Research & Tools `/research` "Methodological resources" (icon: BookOpen)
    - Gallery → `/gallery`
- `navigation.ctaButton` — group `{ label, path }` default `{ "Contact Us", "/contact" }`

- `footer.quickLinks` — array of `{ label, path }`, default 6 links (Home, Who We Are, Impact Reports, Field Dispatches, Methodology Repository, Gallery) — Volunteer entry removed.
- `footer.contactPhone` — text, default `"+1 (555) 123-4567"`
- `footer.contactEmail` — email, default `"info@ruralnexus.org"`
- `footer.contactAddress` — text, default `"123 Innovation Drive, Agro Hub"`
- `footer.copyrightText` — text, default `"© 2026 RuralNexus. All rights reserved."` (year auto-inserted if admin writes `{year}`)

- `social` — array of `{ platform: enum(twitter,linkedin,youtube,instagram), url }` — default empty
- `seo.defaultTitle` — text, default `"RuralNexus"`
- `seo.defaultDescription` — textarea, default uses tagline
- `seo.defaultOgImage` — upload(Media)

**Icon enum** (for nav dropdown items): one enum reused across the whole schema — Layers, Rocket, Info, BarChart3, MessageSquareQuote, BookOpen, Users, Heart, Globe, Target, Zap, Sprout, Droplets, ShieldAlert, Tractor, Check, FileText, Calendar, MapPin, ExternalLink, Quote. Frontend resolves enum → lucide-vue-next component.

---

## 4. HomePage (Global, singleton, route `/`)

### hero group
- `eyebrowTags` — array of text, default `["Action Research", "Sustainable Innovation", "Development", "Food Systems"]`
- `headlineLine1` — text, default `"Transformative Action research for"`
- `headlineEmphasis` — text (italic/gradient span), default `"sustainable innovations"`
- `headlineLine2` — text, default `"from projects to impacts"`
- `subtitle` — textarea, default `"Advancing UN sustainable development goals to build resilient food systems through inter-trans-disciplinary research and strategic consultancy."`
- `backgroundImage` — upload(Media), default URL: `https://images.unsplash.com/photo-1500382017468-9049fed747ef`
- `primaryCta` — group `{ label, path }` default `{ "Explore Our Programs", "/programs" }`
- `secondaryCta` — group `{ label, path }` default `{ "Who We Are", "/about" }`

### whoWeAre group
- `eyebrow` — text, default `"Global Identity"`
- `headingLine1` — text, default `"Who We Are:"`
- `headingLine2Prefix` — text, default `"An"`
- `headingLine2Emphasis` — text, default `"International Network"`
- `headingLine2Suffix` — text, default `"of Excellence"`
- `body` — textarea, default `"RuralNexus is more than just an NGO; it is a decentralized ecosystem of researchers, agronomists, and project managers..."`
- `stats` — array(2) of `{ value, label }` — defaults `[{ "240+", "Research Fellows" }, { "12", "Field Hubs" }]`
- `ctaLabel` — text, default `"Meet the Leadership"`
- `ctaPath` — text, default `"/about"`
- `image` — upload(Media), default URL: `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09`
- `floatingBadge` — group `{ iconEnum, title, body }` default `{ Layers, "Scientific Rigor", "Our transdisciplinary methodology is strictly mapped to UN SDG frameworks." }`

### testimonialsSection group
- `heading` — text, default `'"They say about us"'`
- **Data source:** pulls first 3 from `HomepageTestimonials` collection (already exists). No field here, just heading.

### newsSection group
- `heading` — text, default `"Latest Insights & Reports"`
- `latestEventsCount` — number, default `3`
- `highlightsCount` — number, default `2`
- **Data source:** `NewsEvents` collection with `isHighlight=true` for right column, latest otherwise.

### missionSdgSection group
- `heading` — text, default `"Aligned with the Global Goals"`
- `body` — textarea, default `"Every programmatic area within our operational hub is strictly mapped to the United Nations Sustainable Development Goals..."`
- `ctaLabel` — text, default `"Read our 2026 Impact Report →"`
- `ctaPath` — text, default `"/research"`
- `featuredSdgs` — array(6) of select(1-17), default `[1, 2, 3, 4, 13, 15]` (frontend uses UN-standard colors + labels, hardcoded)

### partnersSection group
- `heading` — text, default `"Collaborating with global leaders & research institutions"`
- `partners` — array of `{ name, logoImage?, displayStyle: enum(text,logo) }` — defaults match current 5 text-styled names: "EcoAgri EU", "GLOBAL HORIZON", "Hohenheim Institute", "UN FAO Data", "AgroNexus"

### seo group
- `metaTitle`, `metaDescription`, `ogImage` (optional overrides of SiteSettings defaults)

---

## 5. AboutPage (Global, route `/about`)

### header group
- `eyebrow` — text, default `"Our Leadership"`
- `heading` — text, default `"Who We Are"`
- `body` — textarea, default `"RuralNexus is an international network of researchers, agronomists, and project managers dedicated to empowering rural resilience through evidence-based innovation."`

### orgSection group
- `heading` — text, default `"Our International Team"`
- `body` — textarea, default `"RuralNexus operates through a decentralized network of specialized program acquisition cells (PACs) and field technical hubs."`
- **Data source:** `Team` collection (already exists, with self-relation for reporting line → drives OrgExplorer)

### seo group

---

## 6. ProgramsPage (Global, route `/programs`) + Programs collection

### Global fields

**header group**
- `eyebrow` — text, default `"Our Structural Methodology"`
- `headlinePrefix` — text, default `"Our"`
- `headlineEmphasis` — text, default `"Programs."`
- `body` — textarea, default `"RuralNexus operates through strategic program areas that provide the structural glue needed for multi-stakeholder and transdisciplinary innovation."`
- `headerBadges` — array of `{ iconEnum, label }` defaults `[{ Layers, "Pillar Based Action" }, { Globe, "Transdisciplinary Scope" }]`

**ctaSection group**
- `heading` — text, default `"Join the RuralNexus Ecosystem"`
- `body` — textarea, default `"Our programs scale through collaborative intelligence. We are seeking academic partners, field organizations, and technology hub collaborators."`
- `primaryCta` — group `{ label, path }` default `{ "Research Partnership", "/contact" }`
- `secondaryCta` — group `{ label, path }` default `{ "Regional Collaboration", "/contact" }`

### Programs collection — extend existing
Existing: title, description, code, colorTheme, sdgs[], initiatives[]
**Add for detail page `/programs/:slug`:**
- `slug` — text, unique, auto from title
- `heroImage` — upload(Media)
- `longDescription` — richText(Lexical) — for detail page body
- `methodologySection` — richText(Lexical) — "How we work on this pillar"
- `seo` group

**Extend `initiatives` array items** (the projects in events.vue "Projects" tab are derived from here):
- `title` — text (existing)
- `desc` — textarea (existing; rename context: short description for program page card)
- `slug` — text, unique within parent program, auto from title
- `location` — text, e.g. `"Turkana, Kenya"`
- `status` — enum `Active | Planning | Completed`, default `Active`
- `stat` — text, headline metric, e.g. `"12 villages, 4.5M L/yr"`
- `iconEnum` — reuse site icon enum (Droplets, Sprout, ShieldAlert, Tractor, etc.)
- `heroImage` — upload(Media), optional — for initiative detail page
- `longDescription` — richText(Lexical), optional — for initiative detail page
- `showInProjectsTab` — checkbox, default `true` — if false, stays on program page but doesn't appear in the flattened events.vue Projects tab

### ProgramDetailPage (Global, controls `/programs/:slug` chrome)
- `initiativesHeading` — text, default `"Active Field Initiatives"`
- `ctaHeading` — text, default `"Partner With This Program"`
- `ctaPath` — text, default `"/contact"`

### InitiativeDetailPage (Global, controls `/programs/:programSlug/initiatives/:initiativeSlug` chrome)
- `relatedHeading` — text, default `"Part of"` (links back to parent program)
- `ctaHeading` — text, default `"Support This Initiative"`

---

## 7. EventsPage / Action Hub (Global, route `/events`)

Note: file is `events.vue` but content is an "Action Hub" with 3 tabs. Keep existing route for now; consider renaming to `/action-hub` in a future cleanup.

### header group
- `eyebrow` — text, default `"Development Hub"`
- `headlinePrefix` — text, default `"The"`
- `headlineEmphasis` — text, default `"Action Hub"`
- `body` — textarea, default `"A comprehensive repository for RuralNexus projects, research publications, and international gatherings designed to drive food system transformation."`

### tabs group
- `projectsTabLabel` — text, default `"Active Projects"`
- `publicationsTabLabel` — text, default `"Publications"`
- `newsTabLabel` — text, default `"News & Events"`

### ctaSection group
- `heading` — text, default `"Catalysing Change Through Collaboration"`
- `body` — textarea, default `"We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects."`
- `ctaLabel` — text, default `"Initiate Contact"`
- `ctaPath` — text, default `"/contact"`

**Data sources:**
- Projects tab → flattened `Programs[].initiatives[]` where `showInProjectsTab=true` (each item exposes `program` relation for the badge). Backend endpoint: `GET /api/initiatives?showcase=true` that does the flattening server-side.
- Publications tab → `Publications` collection (new, see §10)
- News & Events tab → `NewsEvents` collection filtered to `category in [Conference, Webinar, FieldVisit]`

---

## 8. StoriesPage (Global, route `/stories`) + Stories collection

### Global fields
**header group**
- `eyebrow` — text, default `"Field Dispatches"`
- `headlinePrefix` — text, default `"Voices"`
- `headlineEmphasis` — text, default `"from the Nexus."`
- `body` — textarea, default `"First-hand dispatches from our fellows and regional partners—documenting the transdisciplinary journey toward community sovereignty."`

**featuredSection group**
- `overrideCategoryLabel` — text, default `"Featured Insight"`
- **Data source:** Stories where `isFeatured=true` (take first)

**gridSection group**
- `heading` — text, default `"More from the Ground"` (with "the Ground" italicized — split into `headingPrefix` + `headingEmphasis`)
- `body` — textarea, default `"A curated selection of dispatches from our global node network, documenting sustainable breakthroughs and lessons learned."`
- `filterButtonLabel` — text, default `"All Programs"`
- `loadMoreLabel` — text, default `"Explore All Dispatches"`

### Stories collection — extend existing
Existing: title, body (Lexical), image, isFeatured
**Add for detail page `/stories/:slug`:**
- `slug` — text, unique
- `excerpt` — textarea (shown on cards)
- `location` — text
- `program` — text (e.g. "Water Governance") — or relationship → Programs
- `readTime` — text (e.g. "8 min read")
- `author` — text (or relationship → Team)
- `publishedDate` — date
- `gradient` — select: `['emerald-leaf','leaf-cyan','cyan-emerald','leaf-emerald','emerald-leaf-alt','leaf-emerald-alt','cyan-leaf']` — for card decoration
- `seo` group

### StoryDetailPage (Global, `/stories/:slug` chrome)
- `backLinkLabel` — text, default `"Back to Field Dispatches"`
- `relatedHeading` — text, default `"More dispatches"`

---

## 9. GalleryPage (Global, route `/gallery`) + Gallery collection

### Global fields
**header group**
- `eyebrow` — text, default `"Visual Archive"`
- `heading` — text, default `"Media & Gallery"`
- `body` — textarea, default `"A visual record of the work — from field research to community convenings. Explore the people, places and moments that shape RuralNexus."`

**filters group**
- `allLabel` — text, default `"All"`
- `categoryOrder` — array of category enum values (controls filter bar order)

**loadMoreLabel** — text, default `"Load more"`

### Gallery collection — extend existing
Existing: image (required), category (enum), year (1900-2100)
**Add:**
- `title` — text, required (currently placeholder text only)
- `location` — text (e.g. "Kisumu, Kenya")
- `aspectRatio` — select: `['4/3', 'square', '16/10', '3/4']` default `'4/3'` (drives masonry grid)
- `gridSize` — select: `['1x1', '2x1', '1x2']` default `'1x1'` (drives col-span)
- `gradient` — select (same palette as Stories for placeholder before image loads)

---

## 10. NEW Collections

### 10.1 Publications
Fields:
- `title` — text, required
- `slug` — text, unique
- `author` — text
- `category` — enum: `Annual Report`, `Policy Brief`, `Research Paper`, `Workshop`, `Methodology`
- `publishedDate` — date
- `summary` — textarea
- `abstract` — richText(Lexical) — for detail page
- `pdf` — upload(Media, mimeTypes: `['application/pdf']`)
- `featuredImage` — upload(Media) — optional cover
- `seo` group
- Access: public read, admin/editor write

Seed with 3 defaults from events.vue:
- "Impact Report 2026: The Transdisciplinary Gap" / RuralNexus PAC3 Team / Annual Report / March 2026
- "Drought Resilience in Smallholder Systems" / Dr. Sarah K. et al. / Policy Brief / February 2026
- "Action Research: Methodological Sovereignty" / RuralNexus PAC4 Education / Research Paper / January 2026

### 10.2 ~~ProjectShowcase~~ — REMOVED
Decision 2026-04-22: merged into `Programs.initiatives[]` with extended fields (see §6). No separate collection. Events page "Projects" tab flattens `initiatives` where `showInProjectsTab=true`.

### 10.3 ~~VolunteerApplications~~ — REMOVED
Decision 2026-04-22: out of scope. No collection, no `POST /api/volunteer` endpoint. See §13 for volunteer page disposition.

---

## 11. ImpactPage (Global, route `/impact`)

### header group
- `eyebrow` — text, default `"Quantifiable Change"`
- `headlinePrefix` — text, default `"The Intelligence"`
- `headlineEmphasis` — text, default `"behind the mission."`
- `body` — textarea, default `"We publish every outcome—from node health metrics to direct economic shifts—within our open intelligence network..."`

### metricsSource
- **Data source:** `ImpactMetrics` collection (already exists, renders via `<ImpactMetrics />` component)

### assessmentSection group
- `heading` — text, default `"Open Assessment Protocol"`
- `body` — textarea, default `"Our impact data is verified through a transdisciplinary assessment protocol..."`
- `ctaLabel` — text, default `"Explore Methodologies"`
- `ctaPath` — text, default `"/research"`
- `badges` — array(4) of `{ value, label }` defaults `[{"100%","Geographical Data"},{"24/7","Node Monitoring"},{"Peer","Reviewed Outcomes"},{"Public","Ledger Access"}]`

---

## 12. ResearchPage (Global, route `/research`)

### header group
- `eyebrow` — text, default `"Knowledge Sovereignty"`
- `headlinePrefix` — text, default `"Research &"`
- `headlineEmphasis` — text, default `"Resources"`
- `body` — textarea, default `"Open access to our transdisciplinary methodologies, policy briefs, and agronomic tools engineered for rural resilience."`

### filtersSection group
- `searchPlaceholder` — text, default `"Search papers, tools, keywords..."`
- `categories` — array of `{ label, iconEnum }` defaults `[All/Library, Publication/BookOpen, Workshop/FileText, Policy/FileCheck]`
- `emptyStateHeading` — text, default `"No matching resources"`
- `emptyStateBody` — textarea, default `"We couldn't find any papers or methodologies matching your current filter."`
- `clearFiltersLabel` — text, default `"Clear All Filters"`

### submitCtaSection group
- `badge` — text, default `"External Contributions"`
- `heading` — text, default `"Methodological Collaboration"`
- `body` — textarea, default `"Are you a researcher working on rural resilience? We provide a platform for peer-reviewed methodologies and open-source agronomic tools."`
- `ctaLabel` — text, default `"Submit Resource Proposal"`
- `ctaPath` — text, default `"/contact"`

**Data source:** `Publications` collection (new, §10.1)

---

## 13. VolunteerPage — REMOVED

Decision 2026-04-22: volunteer program is out of scope for v1. Actions:
- Delete `src_copy/presentation/screens/volunteer.vue` (and the equivalent `pages/volunteer.vue` when the frontend gets migrated out of `src_copy/`).
- Remove `/volunteer` from the primary nav in `SiteSettings.navigation.primaryLinks` defaults (update §3).
- Remove `/volunteer` from `footer.quickLinks` defaults (update §3).
- Delete existing collections that only served this page: `VolunteerStats`, `FeaturedVolunteers` — or keep them dormant. **Recommendation: keep them dormant** (admin-visible but unused), so re-enabling volunteer later is zero-migration. No public API exposes them once the page is gone.
- Delete `volunteer` use-case (`SubmitVolunteerUseCase` in the Nuxt layer) and associated routes/composables on the frontend.
- No `VolunteerApplications` collection, no `POST /api/volunteer` endpoint will be built.

When volunteer work resumes (future phase), redo as a fresh spec — the current mockup's 4-step process + 9 areas-of-interest can be restored from git history.

---

## 14. ContactPage (Global, route `/contact`)

### header group
- `heading` — text, default `"Partner With Us"`
- `body` — textarea, default `"Whether you are a farming cooperative, a global funding body, or a fellow research institution, RuralNexus is ready to collaborate."`

### formSection group
- `heading` — text, default `"Send an Inquiry"`
- `body` — textarea, default `"Our PA5 Consultancy team aims to respond to all inquiries within 48 hours."`
- `interestAreas` — array of text, defaults match current 5 options (PA1/PA3/PA4/PA5/Other)
- `submitLabel` — text, default `"Submit Inquiry"`
- `successMessage` — text, default `"Message Sent Successfully!"`

### hqSection group
- `eyebrow` — text, default `"Global Headquarters"`
- `orgName` — text, default `"RuralNexus Innovation Center"`
- `address` — textarea, default `"123 Agritech Valley, Innovation District\nGeneva, 1000, Switzerland"`
- `directionsUrl` — text, default `"#"`

### directContacts group
- `eyebrow` — text, default `"Direct Contacts"`
- `contacts` — array of `{ label, email, iconEnum }` defaults:
  - `{ "Press & Dissemination (PA2)", "press@ruralnexus.org", Users }`
  - `{ "Research & Methodology (PA3)", "research@ruralnexus.org", Zap }`

**Form wiring:** replace the current fake `handleSubmit` with a call to `POST /api/contact` (endpoint already built in Phase 3).

---

## 15. NewsEventDetail (route `/news/:slug`) + NewsEvents collection

Route already exists (`news/[id].vue`). Changes:

### NewsEvents collection — extend existing
Existing: title, category, isHighlight, Lexical body, image
**Add for detail page:**
- `slug` — text, unique (migrate IDs)
- `summary` — textarea (shown in listings)
- `publishedDate` — date
- `author` — text or relationship → Team
- `contentHTML` — already have `body` as Lexical, render to HTML for template
- `seo` group

### NewsEventDetailPage (Global, `/news/:slug` chrome)
- `backLinkLabel` — text, default `"Back to Overview"`
- `relatedHeading` — text, default `"Related in {category}"` (supports `{category}` placeholder)
- `notFoundHeading` — text, default `"Article Not Found"`
- `notFoundBody` — textarea, default `"The requested academic article or news event could not be located."`
- `notFoundCtaLabel` — text, default `"Return Home"`
- `notFoundCtaPath` — text, default `"/"`

---

## 16. DonatePage — REMOVED

Decision 2026-04-22: `/donate` is deleted. Actions:
- Delete `src_copy/presentation/screens/donate.vue` (dead "Horizon Aid" template — not RuralNexus).
- Ensure no nav/footer link or inline anchor points to `/donate` (current `SiteSettings` defaults per §3 already exclude it).
- No `DonatePage` global will be created.

---

## 17. Live Preview wiring

### Payload side
Each global + collection gets a `livePreview` config:
```ts
livePreview: {
  url: ({ data }) => `${frontendUrl}/__preview/home-page?token=${previewToken}`,
  breakpoints: [
    { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
    { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
    { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
  ],
}
```

### Nuxt side
- Add composable `usePayloadLivePreview(globalSlug, fetchFn)` — wraps `useAsyncData` but also listens to Payload's `postMessage('payload-live-preview', data)` events and reactively replaces the data.
- Add `/__preview/[...slug].vue` catch-all that bypasses normal caching and renders whichever page with live preview enabled.
- CSP: `api.ruralnexus.org` must be allowed in `frame-ancestors` for preview to iframe from admin. Nuxt config `nitro.routeRules['/__preview/**'] = { headers: { 'Content-Security-Policy': "frame-ancestors 'self' https://api.ruralnexus.org" } }`.

---

## 18. Frontend repository layer (Nuxt side)

Replace `Mock*Repository` imports with HTTP equivalents. DDD boundaries stay intact; only the infrastructure adapters change.

New infrastructure:
- `HttpProgramAreaRepository` → `GET /api/programs` (initiatives embedded via `depth=1`)
- `HttpInitiativeRepository` → `GET /api/initiatives?showcase=true` (backend endpoint flattens `Programs[].initiatives[]`) and `GET /api/initiatives/:programSlug/:initiativeSlug` for detail
- `HttpNewsEventRepository` → `GET /api/news-events?where[isHighlight][equals]=...`
- `HttpTeamRepository` → `GET /api/team?depth=2`
- `HttpStoryRepository` → `GET /api/stories?where[slug][equals]=...`
- `HttpGalleryRepository` → `GET /api/gallery?where[category][equals]=...`
- `HttpPublicationRepository` → `GET /api/publications`
- `HttpPageContentRepository` → `GET /api/globals/{slug}`
- `HttpContactRepository` → `POST /api/contact`
- `HttpSearchRepository` → `GET /api/search?q=...` (consolidated search across NewsEvents, Stories, Publications, Programs — see §20a)
- `HttpImpactMetricsRepository`, `HttpTestimonialRepository`

Shared types: copy `src/payload-types.ts` from backend into Nuxt's `shared/types/payload.ts` during CI build (or publish as a private npm package later).

Base URL: `process.env.NUXT_PUBLIC_API_BASE_URL` = `https://api.ruralnexus.org`.

---

## 19. Frontend deployment — `ruralnexus.org` on Vercel

### Repo
- User: create GitHub repo `rural-nexus-frontend` (separate from backend)
- Move `src_copy/` contents to the new repo's root
- Add `nuxt.config.ts` with `nitro.preset = 'vercel'`

### Vercel setup
- Import GitHub repo in Vercel
- Build command: default (`nuxt build`)
- Env vars: `NUXT_PUBLIC_API_BASE_URL=https://api.ruralnexus.org`

### Hostinger DNS (after Vercel project exists)
- A record: `@` (apex) → `76.76.21.21` (Vercel)
- CNAME: `www` → `cname.vercel-dns.com`
- Remove any default A record Hostinger auto-creates for apex/www that conflicts
- Vercel dashboard → Settings → Domains → add `ruralnexus.org` and `www.ruralnexus.org` — Vercel issues Let's Encrypt cert automatically once DNS resolves

### CORS on backend
- Set Render env `FRONTEND_URL=https://ruralnexus.org,https://www.ruralnexus.org` (already wired to support comma-separated)

---

## 20. Implementation order

Per decisions locked in §2 (2026-04-22):

### Backend (Payload CMS on api.ruralnexus.org)
- [x] **5.1** Add new collection: `Publications` (§10.1) with PDF upload, Lexical abstract, slug
- [x] **5.2** Extend `Programs.initiatives[]` with new fields: `slug`, `location`, `status`, `stat`, `iconEnum`, `heroImage`, `longDescription`, `showInProjectsTab` (§6)
- [x] **5.3** Add `slug` + detail-page fields to existing collections: Stories, NewsEvents; Gallery got `aspectRatio`/`gridSize`/`gradient`
- [x] **5.4** `VolunteerStats` + `FeaturedVolunteers` hidden from admin sidebar (`admin.hidden: true`)
- [x] **5.5** `SiteSettings` global (§3) built + registered
- [x] **5.6** Page globals built with current-mockup defaults (14 globals total):
  SiteSettings, HomePage, AboutPage, ProgramsPage, ProgramDetailPage, InitiativeDetailPage, EventsPage, StoriesPage, StoryDetailPage, GalleryPage, ImpactPage, ResearchPage, ContactPage, NewsEventDetailPage
- [x] **5.7** Custom endpoints built:
  - `GET /api/initiatives?showcase=true` — flattens `Programs[].initiatives[]`
  - `GET /api/initiatives/:programSlug/:initiativeSlug` — initiative detail
  - `GET /api/search?q=&limit=` — consolidated search across NewsEvents, Stories, Publications, Programs
- [x] **5.8** Live Preview wired globally via `admin.livePreview` — frontend URL: `${FRONTEND_URL}/__preview/globals/{slug}` for globals or `/__preview/{collection}/{slug-or-id}` for collections, with mobile/tablet/desktop breakpoints
- [ ] **5.9** Seed script: insert 3 Publications defaults (§10.1)
- [ ] **5.10** Admin smoke-test: open each global in /admin, verify defaults render, edit one field, save

### Frontend (Nuxt on ruralnexus.org)
- [ ] **5.11** Create new GitHub repo `rural-nexus-frontend`. Move `src_copy/` contents to repo root.
- [ ] **5.12** Delete dead pages: `donate.vue`, `volunteer.vue`. Remove their routes from nav/footer.
- [ ] **5.13** Delete `SubmitVolunteerUseCase` + any `/volunteer` composables
- [ ] **5.14** Build `Http*Repository` adapters (§18), wire via a thin container, remove all `Mock*Repository` imports
- [ ] **5.15** Build `usePayloadLivePreview(globalSlug, fetchFn)` composable + `/__preview/[...slug].vue` catch-all + CSP headers (§17)
- [ ] **5.16** Build new detail-page routes:
  - `/programs/[slug].vue`
  - `/programs/[slug]/initiatives/[initiativeSlug].vue`
  - `/stories/[slug].vue`
  - `/publications/[slug].vue`
  - Migrate `/news/[id].vue` to `/news/[slug].vue`
- [ ] **5.17** Wire header search icon → dialog → `HttpSearchRepository.search(q)`, render grouped results
- [ ] **5.18** Rewire `contact.vue` form to `POST /api/contact` (kill the fake `handleSubmit`)
- [ ] **5.19** Add Payload type export flow (copy `src/payload-types.ts` from backend to `shared/types/payload.ts` during CI)
- [ ] **5.20** Deploy Nuxt to Vercel, configure Hostinger DNS (A `@` → 76.76.21.21, CNAME `www` → cname.vercel-dns.com), add domains in Vercel dashboard

### Verification
- [ ] **5.21** Update Render env `FRONTEND_URL=https://ruralnexus.org,https://www.ruralnexus.org`
- [ ] **5.22** End-to-end preview test: open /admin at api.ruralnexus.org, edit HomePage.hero.headlineLine1, see it change live in the iframe pointing to ruralnexus.org/__preview/home-page
- [ ] **5.23** Contact form end-to-end: submit on ruralnexus.org/contact → email delivered to info@ruralnexus.org (or gmail stopgap) → row in ContactInquiries admin list
- [ ] **5.24** Search end-to-end: type a known title in header search → Payload returns it → click through lands on correct detail page

Each sub-phase gets marked `[x]` here as we progress.
