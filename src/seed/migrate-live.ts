/**
 * Targeted live migration — safe to re-run (idempotent).
 *
 * Phase 1 (runs against current deployed schema):
 *   - Remove "Transparency" from about-page values
 *   - Add Ethiopia to East Africa region countries
 *
 * Phase 2 (uncomment AFTER deploying the new backend schema):
 *   - Populate whatWeDoSubheading + whatWeDoBullets on about-page
 *   - Set programAreas on team members
 *
 * Usage:
 *   PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD=yourpass \
 *   npx tsx src/seed/migrate-live.ts
 *
 *   Add --dry-run to preview changes without writing.
 */

const API_BASE = process.env.PAYLOAD_API_BASE ?? 'https://api.ruralnexus.org'
const EMAIL = process.env.PAYLOAD_EMAIL ?? ''
const PASSWORD = process.env.PAYLOAD_PASSWORD ?? ''
const DRY_RUN = process.argv.includes('--dry-run')

if (!EMAIL || !PASSWORD) {
  console.error('Set PAYLOAD_EMAIL and PAYLOAD_PASSWORD environment variables.')
  process.exit(1)
}

async function login(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { token: string }
  console.log('✓ Authenticated')
  return data.token
}

async function patchGlobal(token: string, slug: string, data: Record<string, unknown>) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] POST /api/globals/${slug}:`, JSON.stringify(data, null, 2))
    return
  }
  // Payload v3 globals use POST (not PATCH) for updates
  const res = await fetch(`${API_BASE}/api/globals/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`POST ${slug} failed: ${res.status} ${await res.text()}`)
  console.log(`✓ Updated global: ${slug}`)
}

async function patchDoc(token: string, collection: string, id: number | string, data: Record<string, unknown>) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] PATCH /api/${collection}/${id}:`, JSON.stringify(data, null, 2))
    return
  }
  const res = await fetch(`${API_BASE}/api/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`PATCH ${collection}/${id} failed: ${res.status} ${await res.text()}`)
  console.log(`✓ Patched ${collection}/${id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — existing schema changes
// ─────────────────────────────────────────────────────────────────────────────

async function phase1_aboutPage(token: string) {
  console.log('\n── Phase 1: about-page ──')

  const res = await fetch(`${API_BASE}/api/globals/about-page`)
  const page = await res.json() as {
    valuesSection: { heading: string; values: { id: string; title: string; description: string }[] }
    geographySection: { heading: string; body: string; regions: { id: string; name: string; countries: string }[] }
  }

  // 1. Remove "Transparency" from values
  const filteredValues = page.valuesSection.values.filter(v => v.title !== 'Transparency')
  const transparencyRemoved = filteredValues.length < page.valuesSection.values.length
  if (transparencyRemoved) {
    console.log('  → Removing "Transparency" value')
  } else {
    console.log('  ✓ "Transparency" already removed — skipping')
  }

  // 2. Add Ethiopia to East Africa region
  const updatedRegions = page.geographySection.regions.map(region => {
    if (region.name === 'East Africa' && !region.countries.includes('Ethiopia')) {
      console.log(`  → Adding Ethiopia to East Africa: "${region.countries}" → "${region.countries}, Ethiopia"`)
      return { ...region, countries: `${region.countries}, Ethiopia` }
    }
    return region
  })
  const ethiopiaAdded = updatedRegions.some(
    (r, i) => r.countries !== page.geographySection.regions[i]?.countries
  )
  if (!ethiopiaAdded) console.log('  ✓ Ethiopia already in East Africa — skipping')

  if (transparencyRemoved || ethiopiaAdded) {
    await patchGlobal(token, 'about-page', {
      valuesSection: { ...page.valuesSection, values: filteredValues },
      geographySection: { ...page.geographySection, regions: updatedRegions },
    })
  } else {
    console.log('  ✓ No changes needed for about-page')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — NEW fields (only run AFTER deploying updated backend schema)
// ─────────────────────────────────────────────────────────────────────────────

async function phase2_aboutPageNewFields(token: string) {
  console.log('\n── Phase 2: about-page new fields ──')

  await patchGlobal(token, 'about-page', {
    approachSection: {
      whatWeDoSubheading: 'What We Do?',
      whatWeDoBullets: [
        { bullet: 'Design and implement transdisciplinary research programmes in agrifood systems' },
        { bullet: 'Facilitate multi-stakeholder innovation platforms connecting researchers, farmers, and policymakers' },
        { bullet: 'Co-develop context-specific tools and methodologies for sustainable rural transformation' },
        { bullet: 'Provide technical assistance, capacity building, and institutional strengthening' },
        { bullet: 'Publish and disseminate open-access knowledge resources for the global development community' },
      ],
    },
  })
}

// Team program area assignments (IDs from live API: PA1=3, PA2=4, PA3=1, PA4=2, PA5=5)
// Team IDs from live API: CEO=14, PA1-Manager=15, PA2-Manager=16, PA3-Manager=17
async function phase2_teamProgramAreas(token: string) {
  console.log('\n── Phase 2: team programAreas ──')

  const assignments: Array<{ id: number; name: string; programAreas: number[] }> = [
    { id: 14, name: 'Dr. Hycenth Tim Ndah',  programAreas: [3, 4, 1, 2, 5] }, // CEO — all PAs
    { id: 15, name: 'Martin Mukong Kuma',    programAreas: [1] },              // PA3: Project Design & Planning
    { id: 16, name: 'Zelda Ayengeh Kiawi',   programAreas: [2] },              // PA4: Project Management & Sci. Comm.
    { id: 17, name: 'Wilfred Njungwi Nkwain', programAreas: [3] },             // PA1: Transdisciplinary Research
  ]

  for (const member of assignments) {
    console.log(`  → ${member.name}: programAreas = [${member.programAreas}]`)
    await patchDoc(token, 'team', member.id, { programAreas: member.programAreas })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('🔍 DRY RUN MODE — no changes will be written\n')

  const token = await login()

  // Phase 1: safe to run now
  await phase1_aboutPage(token)

  // Phase 2: uncomment AFTER deploying the updated Payload backend schema
  // await phase2_aboutPageNewFields(token)
  // await phase2_teamProgramAreas(token)

  console.log('\n✅ Migration complete')
}

main().catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})
