import type { Payload } from 'payload'
import { fileURLToPath } from 'url'

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/['"]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

const programs = [
  {
    code: 'PA1',
    title: 'Project Acquisition, Management and Communication',
    description:
      'We specialize in the management and execution of large-scale national and international projects. By building robust networks and leading consortiums funded by the European Union and the international research community, we bridge the gap between high-level research and societal impact. Through these strategic partnerships, we translate collaborative funding into tangible progress for both the academic and global communities.',
    color: 'cyan',
    sdgs: [{ goal: 17 }],
    initiatives: [
      {
        title: 'EU Horizon Consortium Building',
        description:
          'Continuous monitoring and strategic engagement with European framework programmes to identify and pursue consortium-led funding opportunities.',
        status: 'Active',
        showInProjectsTab: true,
      },
      {
        title: 'Grant Writing & Proposal Support Lab',
        description:
          'Providing structural support for complex multi-partner consortium proposals, from concept note to full application.',
        status: 'Active',
        showInProjectsTab: true,
      },
    ],
  },
  {
    code: 'PA2',
    title: 'Networking and Visibility',
    description:
      'We are dedicated to elevating the profile of RuralNexus research within the global scientific community. By showcasing our expertise to international funding bodies and strategic partners, we strengthen our position as a leader in innovation. Through targeted networking and small-scale pilot initiatives, we cultivate the foundational partnerships necessary to build world-class research consortia and secure competitive project funding.',
    color: 'primary',
    sdgs: [{ goal: 4 }, { goal: 9 }],
    initiatives: [
      {
        title: 'Nexus Open Access Publishing',
        description:
          'Ensuring all scientific findings are published in open-access domains, maximising reach and citation impact.',
        status: 'Active',
        showInProjectsTab: true,
      },
      {
        title: 'International Stakeholder Forums',
        description:
          'Bi-annual forums and networking events bridging policymakers, agronomists, funding agencies, and local farmers.',
        status: 'Active',
        showInProjectsTab: true,
      },
    ],
  },
  {
    code: 'PA3',
    title: 'Transdisciplinary and Transformative Research',
    description:
      'The RuralNexus framework is our strategic response to the complex challenges of modern agriculture. As funding bodies like Horizon Europe and the German Federal Ministries (BMBF/BMEL) shift toward mandatory multi-stakeholder approaches, RuralNexus provides the structural "glue" to ensure your research is both fundable and impactful. We connect academic rigour with on-the-ground rural realities through inter-transdisciplinary methodologies.',
    color: 'navy',
    sdgs: [{ goal: 2 }, { goal: 13 }, { goal: 15 }],
    initiatives: [
      {
        title: 'Living Labs Network',
        description:
          'Establishing participatory research plots directly in rural cooperative zones across Africa and Europe.',
        status: 'Active',
        showInProjectsTab: true,
      },
      {
        title: 'TDR Scientific Workshops',
        description:
          'Organising and facilitating transdisciplinary research workshops, producing TDR factsheets, practice abstracts, and conference papers.',
        status: 'Active',
        showInProjectsTab: true,
      },
    ],
  },
  {
    code: 'PA4',
    title: 'Capacity Building and Knowledge Transfer Unit',
    description:
      'This unit is dedicated to fostering capacity building and networking among professionals, particularly focusing on early-career professionals, in the acquisition and implementation of national and international research projects. We facilitate connections and integration of professionals into established research networks, thereby enhancing collaboration opportunities and knowledge exchange within RuralNexus and the broader professional community.',
    color: 'amber',
    sdgs: [{ goal: 4 }, { goal: 8 }],
    initiatives: [
      {
        title: 'Early Career Fellowship Programme',
        description:
          'A funded fellowship for agronomists and rural development professionals studying resilience and transdisciplinary methodologies.',
        status: 'Active',
        showInProjectsTab: true,
      },
      {
        title: 'Rural Extension Knowledge Hubs',
        description:
          'Translating research into daily actionable advice for rural communities through extension worker training and practitioner guides.',
        status: 'Scaling',
        showInProjectsTab: true,
      },
    ],
  },
  {
    code: 'PA5',
    title: 'Consultancy on Various Related Project Areas',
    description:
      'This unit establishes a comprehensive consultation service providing administrative and methodological support tailored to proposal development. We offer specialised assistance in navigating funding bodies at the national level (German federal ministries, DFG) and international level (EU, FAO, NGOs), ensuring a seamless process for project funding and fostering successful collaborations across the organisation.',
    color: 'leaf',
    sdgs: [{ goal: 12 }],
    initiatives: [
      {
        title: 'Funding Body Navigation Service',
        description:
          'Specialised advisory on German federal ministry (BMBF/BMEL), DFG, EU, and international NGO funding requirements and application processes.',
        status: 'Active',
        showInProjectsTab: true,
      },
      {
        title: 'Proposal Evaluation & Project Monitoring',
        description:
          'Short-term consultancy engagements for proposal review, project monitoring, and sustainability audits aligned with EU Green Deal standards.',
        status: 'Active',
        showInProjectsTab: true,
      },
    ],
  },
]

export async function seed(payload: Payload) {
  for (const program of programs) {
    const existing = await payload.find({
      collection: 'programs',
      where: { code: { equals: program.code } },
      limit: 1,
    })

    // Inject slugs for the program and each initiative (slug hook only auto-runs on create).
    const data = {
      ...program,
      slug: slugify(program.title),
      initiatives: program.initiatives.map((init) => ({
        ...init,
        slug: slugify(init.title),
      })),
    }

    if (existing.docs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: 'programs', id: existing.docs[0].id as string, data: data as any })
      payload.logger.info(`[seed:programs] updated: ${program.code} — ${program.title}`)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.create({ collection: 'programs', data: data as any })
      payload.logger.info(`[seed:programs] created: ${program.code} — ${program.title}`)
    }
  }

  payload.logger.info('[seed:programs] done')
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
