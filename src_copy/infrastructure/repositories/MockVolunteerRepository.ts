import type { IVolunteerRepository, FeaturedVolunteer } from '@domain/repositories/IVolunteerRepository';
import type { Volunteer, VolunteerApplication } from '@domain/entities/Volunteer';

export class MockVolunteerRepository implements IVolunteerRepository {
  private featuredVolunteers: FeaturedVolunteer[] = [
    {
      id: 'v1',
      name: 'Amara Diallo',
      role: 'Field Research Assistant',
      location: 'Dakar, Senegal',
      since: 'March 2024',
      quote:
        'Volunteering with RuralNexus changed how I see agriculture. I learned that data and community trust go hand in hand. The field trips were transformative.',
      program: 'Research & Methodology (PA3)',
      initials: 'AD',
      gradient: 'from-leaf-600 to-primary',
    },
    {
      id: 'v2',
      name: 'Lena Hoffmann',
      role: 'Training Coordinator',
      location: 'Berlin, Germany',
      since: 'January 2023',
      quote:
        'I designed capacity-building workshops for smallholder cooperatives in rural Moldova. Remotely co-facilitating with local partners taught me more than any classroom ever could.',
      program: 'Capacity Building (PA4)',
      initials: 'LH',
      gradient: 'from-cyan to-leaf-500',
    },
    {
      id: 'v3',
      name: 'Carlos Vásquez',
      role: 'GIS & Data Volunteer',
      location: 'Bogotá, Colombia',
      since: 'June 2024',
      quote:
        'Mapping soil degradation patterns across the Andes was the most meaningful work I have done with my GIS skills. The team supported me every step of the way.',
      program: 'Living Labs (PA3)',
      initials: 'CV',
      gradient: 'from-primary-container to-leaf-700',
    },
    {
      id: 'v4',
      name: 'Priya Nair',
      role: 'Communications & Translation',
      location: 'Mumbai, India',
      since: 'September 2023',
      quote:
        'Translating research findings into accessible community briefings in three languages was challenging and deeply rewarding. Real impact, real communities.',
      program: 'Press & Dissemination (PA2)',
      initials: 'PN',
      gradient: 'from-amber-500 to-leaf-600',
    },
    {
      id: 'v5',
      name: 'James Otieno',
      role: 'Agronomy Support',
      location: 'Nairobi, Kenya',
      since: 'February 2024',
      quote:
        'Working with farmers in Western Kenya to pilot drought-resistant crop varieties was exactly why I studied agriculture. RuralNexus made it happen.',
      program: 'Field Research (PA3)',
      initials: 'JO',
      gradient: 'from-leaf-700 to-primary-container',
    },
    {
      id: 'v6',
      name: 'Sofia Andersen',
      role: 'Grant & Reporting Support',
      location: 'Copenhagen, Denmark',
      since: 'October 2023',
      quote:
        'I helped consolidate mid-term reporting for an EU Horizon project. It gave me real insight into how large-scale international NGO funding really works in practice.',
      program: 'Project Acquisition (PA1)',
      initials: 'SA',
      gradient: 'from-primary to-cyan',
    },
  ];

  async submit(application: VolunteerApplication): Promise<Volunteer> {
    // Simulates async persistence with a small network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      ...application,
      id: `vol_${Date.now()}`,
      submittedAt: new Date(),
    };
  }

  async getFeaturedVolunteers(): Promise<FeaturedVolunteer[]> {
    return this.featuredVolunteers;
  }
}
