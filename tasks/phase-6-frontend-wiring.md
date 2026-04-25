# Phase 6 — Frontend CMS Wiring (Handoff Document)

## Context

This is the RuralNexus NGO website. Two repos:

| Repo | Stack | Location | URL |
|------|-------|----------|-----|
| `ngo-website-backend` | Payload CMS 3 · Next.js 16 · Supabase Postgres | `~/Desktop/ngo-website-backend` | `http://localhost:3000` in dev |
| `ngo-website` | Nuxt 4 · Tailwind v4 · TypeScript | `~/Desktop/ngo-website` | `http://localhost:3001` in dev |

The backend is fully built (collections, globals, custom endpoints). The frontend is partially wired. This document describes **exactly what remains**, in priority order.

---

## Architecture quick-ref

### Payload REST API (backend)
- Collections: `GET /api/{slug}?limit=N&depth=N&where[field][op]=val&sort=-field`
- Globals: `GET /api/globals/{slug}`
- Custom endpoints: `GET /api/initiatives?showcase=true`, `GET /api/search?q=`, `POST /api/contact`

### Frontend conventions
- `srcDir: 'src/presentation/'`, pages in `screens/`
- Aliases: `@domain`, `@application`, `@infrastructure`
- Shared fetch wrapper: `$fetch(apiBase + path)` where `apiBase = useRuntimeConfig().public.apiBase`
- Lexical richText → HTML: `import { lexicalToHtml } from '../utils/lexicalToHtml'`
- Live preview composable: `import { usePayloadLivePreview } from '../composables/usePayloadLivePreview'`

### What is already done ✅
- `index.vue` — fully wired to `home-page` global + programs + news-events
- `events.vue` — wired to initiatives, publications, news-events APIs
- `stories.vue` — wired to stories API
- `gallery.vue` — wired to gallery API
- `research.vue` — wired to publications API
- `contact.vue` — wired to `POST /api/contact` with v-model form
- `GlobalHeader.vue` — Volunteer link removed, inline search wired to `/search`
- Detail routes: `news/[slug].vue`, `stories/[slug].vue`, `publications/[slug].vue`, `programs/[slug].vue`
- New pages: `search.vue`, `__preview/[...slug].vue`
- HTTP repos: `HttpProgramAreaRepository.ts`, `HttpNewsEventRepository.ts`
- Utilities: `utils/lexicalToHtml.ts`, `composables/usePayloadLivePreview.ts`

---

## Phase 6.1 — Wire remaining list pages to their Payload globals

Each list/section page has **hardcoded copy in its template**. Wire each one by fetching the corresponding global and replacing the hardcoded strings. Pattern is identical to `index.vue`.

For every page below:
1. Add `useAsyncData('page-global', () => $fetch<PageGlobalType>(`${apiBase}/api/globals/${globalSlug}`))` in `<script setup>`
2. Replace hardcoded strings with `page?.field ?? 'fallback'`
3. Keep existing API data fetches untouched

### 6.1.1 `programs.vue` → global `programs-page`
Global fields used in template:
```
header.eyebrow         → "Our Structural Methodology"
header.headlinePrefix  → "Our"
header.headlineEmphasis→ "Programs."
header.body            → description paragraph
```
The program cards (dynamic data) are already wired via `HttpProgramAreaRepository`.

**Also add**: a "View Details" `NuxtLink` to each program card pointing to `/programs/${area.slug}`.  
The `HttpProgramAreaRepository.getAll()` call fetches `depth=1` which includes `slug`. Add `slug` to the `ProgramArea` domain entity (`src/domain/entities/ProgramArea.ts`) and pass it through from the HTTP repo.

### 6.1.2 `about.vue` → global `about-page`
Global slug: `about-page`  
Global fields:
```
header.eyebrow, header.headlineLine1, header.headlineEmphasis, header.body
valuesSection.heading, valuesSection.values[{icon, title, body}]
teamSection.heading, teamSection.body
```
The OrgExplorer / team data still uses `MockTeamRepository` — leave it mocked for now.

### 6.1.3 `events.vue` → global `events-page`
Global slug: `events-page`  
Global fields:
```
header.eyebrow, header.headlinePrefix, header.headlineEmphasis, header.body
```
The three-tab data (initiatives, publications, news-events) is already wired.

### 6.1.4 `stories.vue` → global `stories-page`
Global slug: `stories-page`  
Global fields:
```
header.eyebrow, header.headline, header.body
gridSection.heading, gridSection.body
```

### 6.1.5 `gallery.vue` → global `gallery-page`
Global slug: `gallery-page`  
Global fields:
```
header.eyebrow, header.headline, header.body
```

### 6.1.6 `research.vue` → global `research-page`
Global slug: `research-page`  
Global fields:
```
header.eyebrow, header.headlinePrefix, header.headlineEmphasis, header.body
filtersSection.searchPlaceholder
filtersSection.categories[{label, icon}]  ← replace hardcoded categories array
filtersSection.emptyStateHeading, filtersSection.emptyStateBody, filtersSection.clearFiltersLabel
submitCtaSection.badge, submitCtaSection.heading, submitCtaSection.body
submitCtaSection.ctaLabel, submitCtaSection.ctaPath
```
Note: the categories from the global use `label` (not `name`) and `icon` (string, not Lucide component). Map `icon` string to Lucide component using the same `ICON_MAP` pattern as `events.vue`.

### 6.1.7 `contact.vue` → global `contact-page`
Global slug: `contact-page`  
Global fields:
```
header.eyebrow, header.headline, header.body
formSection.heading, formSection.subheading
formSection.interestAreaOptions[{label, value}]  ← replace hardcoded select options
infoSection.address, infoSection.departments[{title, email}]
```

### 6.1.8 `impact.vue` → global `impact-page`
Global slug: `impact-page`  
Global fields:
```
header.eyebrow, header.headlinePrefix, header.headlineEmphasis, header.body
```
The `ImpactMetrics` component currently uses hardcoded data — see Phase 6.4.

---

## Phase 6.2 — Wire site-wide chrome to SiteSettings global

Global slug: `site-settings`

### 6.2.1 `GlobalFooter.vue` — fully hardcoded, must be wired
Fetch `GET /api/globals/site-settings` and replace:
```
footer.quickLinks[{label, path}]        → v-for loop replacing 7 hardcoded links
footer.contactPhone                     → phone display
footer.contactEmail                     → email link
footer.contactAddress                   → address display
footer.copyrightText                    → replace {year} with new Date().getFullYear()
brand.name                              → "RuralNexus" in footer branding
brand.tagline                           → tagline paragraph
social[{platform, url}]                 → social icon links
```
Social icon rendering: map platform string `'twitter' | 'linkedin' | 'youtube' | 'instagram' | 'facebook'` to SVG icons inline (or Lucide equivalents).

### 6.2.2 `GlobalHeader.vue` — nav links hardcoded (lower priority)
The nav links work fine hardcoded. Optionally wire `navigation.primaryLinks` from the same `site-settings` global. Skip if not needed immediately.

---

## Phase 6.3 — Wire HomepageTestimonials collection

`index.vue` testimonials section currently renders 3 placeholder `v-for="i in 3"` divs.

Replace with:
```ts
const { data: testimonialsData } = await useAsyncData('testimonials', () =>
  $fetch(`${apiBase}/api/homepage-testimonials?limit=3&depth=1&sort=order`)
)
```

Collection fields: `quote`, `name`, `title`, `organization`, `avatar` (upload → media).

Template: render `testimonial.quote`, `testimonial.name`, `testimonial.title`, `testimonial.avatar?.url` (with fallback gradient if no avatar).

---

## Phase 6.4 — Wire ImpactMetrics collection

`impact.vue` renders an `<ImpactMetrics />` component. Read `src/presentation/components/ImpactMetrics.vue` first to see what props it accepts.

Fetch from:
```ts
$fetch(`${apiBase}/api/impact-metrics?limit=50&depth=1&sort=order`)
```

Collection fields: `metric`, `value`, `unit`, `description`, `icon`, `category`, `trend` (`up`|`down`|`stable`).

Pass the fetched array as a prop to `<ImpactMetrics :items="metricsData?.docs ?? []" />` and update the component to accept + render that prop rather than internal hardcoded data.

---

## Phase 6.5 — SEO meta tags on all pages

All Payload globals and detail collections have a `seo` group with `metaTitle`, `metaDescription`, `ogImage`.

For each global-backed page already wired in 6.1:
```ts
useHead({
  title: page?.seo?.metaTitle ?? page?.header?.headline ?? 'RuralNexus',
  meta: [
    { name: 'description', content: page?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: page?.seo?.ogImage?.url ?? '' },
  ],
})
```

For detail pages (`news/[slug].vue`, `stories/[slug].vue`, `publications/[slug].vue`, `programs/[slug].vue`) — these already have `useHead` wired with `seo.title` and `seo.description`. Add `og:image` from `seo.ogImage?.url`.

---

## Phase 6.6 — Live Preview integration

The `usePayloadLivePreview` composable (`src/presentation/composables/usePayloadLivePreview.ts`) is written but no page uses it yet.

Wire it in each global-backed page so the Payload admin live preview iframe updates in real time.

Pattern (same for every page):
```ts
// After fetching the global:
const { data: rawPage } = await useAsyncData('page-global', () => $fetch(...))

// Wire live preview — overrides data when postMessage arrives from Payload admin
const { previewData: page } = usePayloadLivePreview(rawPage.value ?? {})
```

Then use `page.value?.field` in the template (same as the existing `page?.field` but `page` is now a `Ref` updated by postMessage).

Apply to: `index.vue`, `about.vue`, `programs.vue`, `events.vue`, `stories.vue`, `gallery.vue`, `research.vue`, `contact.vue`, `impact.vue`

For detail pages, wire it to the document object (not the global).

---

## Phase 6.7 — Programs page: add slug to domain entity + detail links

Currently `programs.vue` shows cards but doesn't link to `/programs/[slug]`.

1. Add `slug: string` to `src/domain/entities/ProgramArea.ts`
2. In `HttpProgramAreaRepository.ts`, add `slug: p.slug` to the `adapt()` function
3. In `programs.vue` template, add a `NuxtLink` on each card:
   ```html
   <NuxtLink :to="`/programs/${area.slug}`" class="...">
     View Program Details →
   </NuxtLink>
   ```

---

## Phase 6.8 — Deployment

### Backend (Render)
The backend is already deployed. Push the latest code:
```bash
cd ~/Desktop/ngo-website-backend
git add -A && git commit -m "feat: phase 5-6 content architecture + frontend wiring"
git push
```

### Frontend (Vercel — first deploy)
```bash
cd ~/Desktop/ngo-website
# Ensure git is initialised
git init && git add -A && git commit -m "feat: initial Nuxt 4 frontend with Payload integration"
```
Then in Vercel dashboard or CLI:
- New project → import `ngo-website`
- Framework: Nuxt.js
- Environment variable: `NUXT_PUBLIC_API_BASE=https://<render-backend-url>`
- Deploy

### DNS (Hostinger → Vercel)
After Vercel assigns a domain:
- Add `ruralnexus.org` custom domain in Vercel
- In Hostinger DNS: add `A` record → Vercel IP, `CNAME www` → `cname.vercel-dns.com`
- In Payload backend `.env` on Render: set `FRONTEND_URL=https://ruralnexus.org`

---

## Phase 6.9 — Content entry (admin tasks)

Once deployed, enter real content via `https://<backend-url>/admin`:

| Priority | Item |
|----------|------|
| High | Fill all globals (home-page, site-settings, about-page, programs-page, etc.) — defaults are already set, just review/update |
| High | Create 3–5 News & Events with `isHighlight: true` for homepage |
| High | Create Programs (PA1–PA5) with `showInProjectsTab: true` on at least 3 initiatives |
| Medium | Upload real images to Media (replace Unsplash placeholders in globals) |
| Medium | Add 3+ Field Stories with `isFeatured: true` on one |
| Medium | Add Gallery items |
| Low | Add Team members |
| Low | Add HomepageTestimonials |
| Low | Run seed script: `npm run seed` (inserts 3 default Publications) |

---

## Execution order recommendation

```
✅ 6.1.1 programs.vue + slug fix (6.7)   ← done
✅ 6.1.2 about.vue                        ← done
✅ 6.1.3–6.1.8 remaining list pages       ← done (events, stories, gallery, research, contact, impact)
✅ 6.2.1 GlobalFooter                     ← done
✅ 6.3 Testimonials                       ← done (index.vue)
✅ 6.4 ImpactMetrics                      ← done (component accepts prop + impact.vue fetches collection)
✅ 6.5 SEO meta                           ← done (og:image added to all pages + detail routes)
✅ 6.6 Live Preview integration           ← done (all 9 global-backed pages wired)
⬜ 6.8 Deployment
⬜ 6.9 Content entry
```

---

## Key file paths (frontend)

```
src/
  domain/entities/ProgramArea.ts                    ← add slug field (6.7)
  infrastructure/repositories/
    HttpProgramAreaRepository.ts                    ← add slug to adapt() (6.7)
    HttpNewsEventRepository.ts
  presentation/
    composables/
      usePayloadLivePreview.ts                      ← wire in all pages (6.6)
    utils/lexicalToHtml.ts                          ← already done
    components/
      GlobalHeader.vue                              ← done
      GlobalFooter.vue                              ← wire in 6.2.1
      ImpactMetrics.vue                             ← update for dynamic props (6.4)
    screens/
      index.vue                                     ← done
      about.vue                                     ← 6.1.2
      programs.vue                                  ← 6.1.1 + 6.7
      events.vue                                    ← done
      stories.vue                                   ← done (wire global in 6.1.4)
      gallery.vue                                   ← done (wire global in 6.1.5)
      research.vue                                  ← done (wire global in 6.1.6)
      contact.vue                                   ← done (wire global in 6.1.7)
      impact.vue                                    ← 6.1.8 + 6.4
      search.vue                                    ← done
      programs/[slug].vue                           ← done
      stories/[slug].vue                            ← done
      publications/[slug].vue                       ← done
      news/[slug].vue                               ← done
      __preview/[...slug].vue                       ← done
```

## Key file paths (backend)

```
src/
  collections/       Programs, NewsEvents, Stories, Gallery, Publications,
                     ImpactMetrics, HomepageTestimonials, Team, ...
  globals/           HomePage, AboutPage, ProgramsPage, EventsPage, StoriesPage,
                     GalleryPage, ResearchPage, ContactPage, ImpactPage,
                     SiteSettings, ProgramDetailPage, StoryDetailPage,
                     NewsEventDetailPage, InitiativeDetailPage
  endpoints/         initiatives.ts, search.ts, contact.ts
  seed/publications.ts   ← run with: npm run seed
```
