import type { ProgramArea } from '@domain/entities/ProgramArea';
import type { IProgramAreaRepository } from '@domain/repositories/IProgramAreaRepository';

export class MockProgramAreaRepository implements IProgramAreaRepository {
  private mockData: ProgramArea[] = [
    { 
      id: '1', code: 'PA1', title: 'Project Acquisition', 
      description: 'Identifying and securing international, national, and state-level funding to drive transdisciplinary innovation.', 
      icon: 'Briefcase', colorTheme: 'cyan',
      sdgs: [
        { code: 'SDG17', title: 'Partnerships for the Goals', color: '#19486A' }
      ],
      initiatives: [
        { title: 'EU Horizon Scouting', desc: 'Continuous monitoring of European framework programmes.' },
        { title: 'Grant Writing Lab', desc: 'Providing structural support for complex multi-partner consortium proposals.' }
      ]
    },
    { 
      id: '2', code: 'PA2', title: 'Project Management & Dissemination', 
      description: 'Elevating research profiles through extensive multi-stakeholder communication and rigorous project lifecycle management.', 
      icon: 'Share2', colorTheme: 'primary',
      sdgs: [
        { code: 'SDG4', title: 'Quality Education', color: '#C5192D' },
        { code: 'SDG9', title: 'Industry, Innovation and Infrastructure', color: '#FD6925' }
      ],
      initiatives: [
        { title: 'Nexus Open Access', desc: 'Ensuring all scientific findings are published in open-access domains.' },
        { title: 'Stakeholder Forums', desc: 'Bi-annual forums bridging policymakers, agronomists, and local farmers.' }
      ]
    },
    { 
      id: '3', code: 'PA3', title: 'Transdisciplinary Research', 
      description: 'Providing the structural glue that connects academic rigorous methodologies with on-the-ground rural realities.', 
      icon: 'Microscope', colorTheme: 'navy',
      sdgs: [
        { code: 'SDG2', title: 'Zero Hunger', color: '#DDA63A' },
        { code: 'SDG13', title: 'Climate Action', color: '#3F7E44' },
        { code: 'SDG15', title: 'Life on Land', color: '#56C02B' }
      ],
      initiatives: [
        { title: 'Living Labs', desc: 'Establishing participatory research plots directly in rural cooperative zones.' },
        { title: 'Agroecology Metrics', desc: 'Developing new APIs and sensors to monitor biodiversity in farming.' }
      ]
    },
    { 
      id: '4', code: 'PA4', title: 'Capacity Building & Knowledge Transfer', 
      description: 'Fostering networking and training for early-career professionals, translating academic findings into accessible practitioner guides.', 
      icon: 'GraduationCap', colorTheme: 'amber',
      sdgs: [
        { code: 'SDG4', title: 'Quality Education', color: '#C5192D' },
        { code: 'SDG8', title: 'Decent Work and Economic Growth', color: '#A21942' }
      ],
      initiatives: [
        { title: 'Early Career Fellowship', desc: 'A 2-year funded position for agronomists studying resilience.' },
        { title: 'Rural Extension Hubs', desc: 'Translating research into daily actionable advice for rural communities.' }
      ]
    },
    { 
      id: '5', code: 'PA5', title: 'Consultancy Services', 
      description: 'Methodological advice and specialized consultancy for external NGOs, government bodies, and agribusinesses looking to transition towards sustainability.', 
      icon: 'Handshake', colorTheme: 'leaf',
      sdgs: [
        { code: 'SDG12', title: 'Responsible Consumption', color: '#BF8B2E' }
      ],
      initiatives: [
        { title: 'Sustainability Audits', desc: 'Evaluating cooperative supply chains against EU Green Deal standards.' },
        { title: 'Policy Advisory Taskforce', desc: 'Drafting whitepapers for regional agricultural ministries.' }
      ]
    },
  ];

  async getAll(): Promise<ProgramArea[]> {
    return this.mockData;
  }

  async getById(id: string): Promise<ProgramArea | null> {
    return this.mockData.find(pa => pa.id === id) || null;
  }
}
