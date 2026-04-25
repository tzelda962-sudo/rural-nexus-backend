import type { TeamMember, ITeamRepository } from '@domain/repositories/ITeamRepository';

export class MockTeamRepository implements ITeamRepository {
  private mockTeam: TeamMember[] = [
    { 
      id: 'dir1', name: 'Dr. Jane Smith', role: 'Director', parentId: null,
      bio: 'Over 20 years bridging academic agronomy with international policy.',
      expertise: ['Agroecology', 'Policy Advisory', 'Consortium Management']
    },
    { id: 'boa1', name: 'Prof. David Okoye', role: 'Advisory', parentId: 'dir1' },
    { id: 'boa2', name: 'Elena Rostova', role: 'Advisory', parentId: 'dir1' },
    
    { 
      id: 'pac1', name: 'Alan Turing', role: 'PAC-1 Acquisition', parentId: 'dir1',
      bio: 'Expert in EU frameworks and securing multi-million euro resilience grants.',
      expertise: ['Grant Writing', 'EU Horizon', 'Budgeting']
    },
    { id: 'pac2', name: 'Marie Curie', role: 'PAC-2 Dissemination', parentId: 'dir1' },
    { id: 'pac3', name: 'Nikola Tesla', role: 'PAC-3 Transdisciplinary', parentId: 'dir1' },
    { id: 'pac4', name: 'Grace Hopper', role: 'PAC-4 Capacity Building', parentId: 'dir1' },
    { id: 'pac5', name: 'G.W. Carver', role: 'PAC-5 Consultancy', parentId: 'dir1' },
    
    // Sub-handlers for PAC3 to show depth
    { id: 'th3_1', name: 'Ada Lovelace', role: 'Living Labs Lead', parentId: 'pac3' },
    { id: 'th3_2', name: 'Rosalind Franklin', role: 'Data Analytics', parentId: 'pac3' },
    { id: 'th3_3', name: 'Ibn al-Haytham', role: 'Field Technician', parentId: 'pac3' },
    
    // Sub-handlers for PAC4
    { id: 'th4_1', name: 'Maria Montessori', role: 'Curriculum Dev', parentId: 'pac4' },
    { id: 'th4_2', name: 'John Dewey', role: 'Extension Liaison', parentId: 'pac4' },
  ];

  async getOrganigram(): Promise<TeamMember[]> {
    return this.mockTeam;
  }
}
