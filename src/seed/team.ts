import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

type MockMember = {
  mockId: string
  name: string
  role: string
  memberType: 'ceo' | 'pa-manager' | 'advisory' | 'staff'
  parentMockId: string | null
  bio?: string
  expertise?: string[]
}

/**
 * Real team data. PA-4 and PA-5 managers and the Managing Assistant are
 * omitted for now — they can be added via the admin dashboard.
 *
 * Consulting experts and professor contacts are all grouped under
 * memberType 'advisory' (Advisory Board) with no parent.
 */
const members: MockMember[] = [
  // ── Core management ──────────────────────────────────────────────────
  {
    mockId: 'ceo',
    name: 'Dr. Hycenth Tim Ndah',
    role: 'CEO & Managing Director',
    memberType: 'ceo',
    parentMockId: null,
    bio: "CEO and Managing Director of RuralNexus, with extensive expertise in agricultural sciences, agronomy, and rural development under Germany's jurisdiction.",
    expertise: ['Agricultural Sciences', 'Agronomy', 'Rural Development', 'Project Management'],
  },
  {
    mockId: 'pac1',
    name: 'Martin Mukong Kuma',
    role: 'PA-1 Manager',
    memberType: 'pa-manager',
    parentMockId: 'ceo',
    bio: 'MSc-qualified PA Manager leading Project Acquisition, Management and Communication activities within the RuralNexus network.',
    expertise: ['Project Acquisition', 'Grant Management', 'Communication'],
  },
  {
    mockId: 'pac2',
    name: 'Zelda Ayengeh Kiawi',
    role: 'PA-2 Manager',
    memberType: 'pa-manager',
    parentMockId: 'ceo',
    bio: 'PA Manager overseeing Networking and Visibility, cultivating strategic partnerships with international funding bodies and research consortia.',
    expertise: ['Networking', 'Visibility', 'Strategic Partnerships'],
  },
  {
    mockId: 'pac3',
    name: 'Wilfred Njungwi Nkwain',
    role: 'PA-3 Manager',
    memberType: 'pa-manager',
    parentMockId: 'ceo',
    bio: 'MSc-qualified PA Manager coordinating Transdisciplinary and Transformative Research, linking academic institutions with rural field sites.',
    expertise: ['Transdisciplinary Research', 'Field Research', 'Methodology'],
  },

  // ── Advisory Board (consulting experts + professor contacts) ──────────
  {
    mockId: 'adv1',
    name: 'Dr. Johannes Schuler',
    role: 'Consulting Expert',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Agricultural Sciences'],
  },
  {
    mockId: 'adv2',
    name: 'Dr. Beatriz Herera',
    role: 'Consulting Expert',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Rural Development'],
  },
  {
    mockId: 'adv3',
    name: 'Dr. Fanos Birke',
    role: 'Consulting Expert',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Food Systems'],
  },
  {
    mockId: 'adv4',
    name: 'Dr. Katharina Diehl',
    role: 'Consulting Expert',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Agronomy'],
  },
  {
    mockId: 'adv5',
    name: 'Dr. Ndambi Asaah',
    role: 'Consulting Expert',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Transdisciplinary Research'],
  },
  {
    mockId: 'adv6',
    name: 'Prof. Dr. Stefan Sieber',
    role: 'Advisory Contact',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Sustainability Research'],
  },
  {
    mockId: 'adv7',
    name: 'Prof. Dr. Patricia Fry',
    role: 'Advisory Contact',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Agricultural Policy'],
  },
  {
    mockId: 'adv8',
    name: 'Prof. Dr. Regina Birner',
    role: 'Advisory Contact',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Rural Development Policy'],
  },
  {
    mockId: 'adv9',
    name: 'Prof. Dr. Marc Corbeels',
    role: 'Advisory Contact',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Soil Science', 'Agronomy'],
  },
  {
    mockId: 'adv10',
    name: 'Prof. Dr. Andrea Knierim',
    role: 'Advisory Contact',
    memberType: 'advisory',
    parentMockId: null,
    expertise: ['Rural Innovation Systems'],
  },
]

export async function seed(payload: Payload) {
  // First, wipe existing placeholder team members so we start clean.
  // We identify placeholders by checking if the name is NOT in our real list.
  const realNames = new Set(members.map((m) => m.name))
  const existing = await payload.find({ collection: 'team', limit: 100, depth: 0 })
  for (const doc of existing.docs) {
    if (!realNames.has(doc.name as string)) {
      await payload.delete({ collection: 'team', id: doc.id as string })
      payload.logger.info(`[seed:team] deleted placeholder: ${doc.name}`)
    }
  }

  const idMap = new Map<string, string>()

  // Seed members in declaration order (parents before children).
  for (const member of members) {
    const already = await payload.find({
      collection: 'team',
      where: { name: { equals: member.name } },
      limit: 1,
      depth: 0,
    })

    if (already.docs.length > 0) {
      const [existingDoc] = already.docs
      if (typeof existingDoc.show === 'undefined') {
        await payload.update({
          collection: 'team',
          id: existingDoc.id,
          data: { show: true },
        })
        payload.logger.info(`[seed:team] patched show=true — ${member.name}`)
      } else {
        payload.logger.info(`[seed:team] skip — already exists: ${member.name}`)
      }
      idMap.set(member.mockId, existingDoc.id as string)
      continue
    }

    const parentId = member.parentMockId ? idMap.get(member.parentMockId) : undefined

    const created = await payload.create({
      collection: 'team',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        name: member.name,
        role: member.role,
        memberType: member.memberType,
        show: true,
        ...(member.bio ? { bio: member.bio } : {}),
        ...(parentId ? { parent: parentId } : {}),
        ...(member.expertise ? { expertise: member.expertise.map((skill) => ({ skill })) } : {}),
      } as any,
    })

    idMap.set(member.mockId, created.id as string)
    payload.logger.info(`[seed:team] created: ${member.name}`)
  }

  payload.logger.info('[seed:team] done')
}

// Standalone runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ;(async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('../payload.config')
    const payload = await getPayload({ config })
    await seed(payload)
    process.exit(0)
  })().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
