import type { NewsEvent, INewsEventRepository } from '@domain/repositories/INewsEventRepository';

export class MockNewsEventRepository implements INewsEventRepository {
  private mockEvents: NewsEvent[] = [
    { 
      id: '1', title: 'Annual Global Agriculture Summit 2026', date: '21.01.2026', 
      summary: 'RuralNexus leadership will keynote the opening session on bridging the gap between high-tech sensors and traditional rural farming knowledge.', 
      isHighlight: true, highlightCategory: 'Top in agricultural research', category: 'Workshop',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80',
      contentHTML: `
        <p class="mb-4">We are thrilled to announce that Dr. Jane Smith, Director of RuralNexus, will deliver the opening keynote at the Annual Global Agriculture Summit 2026 in Geneva. Her talk, titled "The Silicon Field: Merging High-Tech Sensors with Generational Farming Intuition," addresses the core friction point in modern agricultural policy.</p>
        <p class="mb-4">The summit gathers over 5,000 policymakers, technologists, and agronomists to set the agenda for the next decade of food security under the shadow of accelerated climate change.</p>
        <h3 class="text-2xl font-display font-bold mt-8 mb-4">Key Priorities for the Summit</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Finalizing the global framework for carbon-credit tracking in small-to-medium farming co-ops.</li>
          <li>Standardizing open-source data layers for soil moisture analytics.</li>
          <li>Creating equitable funding structures for the Global South.</li>
        </ul>
        <blockquote class="border-l-4 border-amber pl-4 italic my-8 text-lg font-display text-on-surface-variant">"Technology without sociological implementation is just expensive metal. We must focus on the humans adopting the tools, not just the tools themselves." – Dr. Jane Smith</blockquote>
      `
    },
    { 
      id: '2', title: 'New EU Horizon Funding Approved', date: '15.02.2026', 
      summary: 'RuralNexus successfully secured €4.2M to lead Project GreenRoots, a multi-national initiative spanning 5 countries over 4 years.', 
      isHighlight: true, highlightCategory: 'New releases', category: 'Funding',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f296c0bceee?auto=format&fit=crop&q=80',
      contentHTML: `
        <p class="mb-4">After a rigorous 18-month proposal phase managed by our PA1 (Project Acquisition) node, the European Commission has officially awarded Project GreenRoots the highly coveted Horizon 2026 grant.</p>
        <p class="mb-4">This €4.2M initiative will fund active living labs across Italy, Spain, France, Greece, and Portugal. The focus is specifically on developing drought-resistant crop rotation methodologies that do not rely heavily on synthetic petroleum-based fertilizers.</p>
        <p class="mb-4">Recruitment for 12 new early-career fellowships will begin next month in coordination with PA4.</p>
      `
    },
    { 
      id: '3', title: 'Publication: Resilience in Farming Networks', date: '12.04.2026', 
      summary: 'Our transdisciplinary team published a 40-page open-access paper detailing the correlation between biodiversity and economic stability in regional cooperatives.', 
      isHighlight: true, highlightCategory: 'Publication', category: 'Publication',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80',
      contentHTML: `
        <p class="mb-4">Can biodiversity actually protect farmers from macroeconomic shocks? According to our latest publication in the <em>Journal of Agronomic Economics</em>, the answer is a resounding yes.</p>
        <p class="mb-4">Led by the PA3 Transdisciplinary Research team, this study analyzed 400 regional cooperatives over a 10-year period. It found that farms utilizing complex crop rotation and maintaining at least 15% wild biodiversity margins suffered 40% less revenue volatility during bad weather events compared to monoculture counterparts.</p>
        <a href="#" class="inline-block mt-4 text-primary font-bold hover:underline">Download the full Open Access PDF (4.2 MB)</a>
      `
    },
    { 
      id: '4', title: 'Workshop: Modern Soil Conservation', date: '04.03.2026', 
      summary: 'A hands-on methodology workshop for regional extension workers led by PA4 Capacity Building team.', 
      isHighlight: false, category: 'Workshop',
      contentHTML: '<p>A successful three-day intensive analyzing the latest mechanical and biological methods for preventing topsoil erosion...</p>'
    },
    { 
      id: '5', title: 'Field Report: Drone Mapping in the Alps', date: '18.05.2026', 
      summary: 'Testing low-cost multispectral drones to identify early blight onset in high-altitude potato crops.', 
      isHighlight: false, category: 'Field Report',
      contentHTML: '<p>Our PA3 team spent two weeks above 1500m testing consumer-grade drones modified with open-source multi-spectral cameras...</p>'
    },
    { 
      id: '6', title: 'Policy Advisory: Water Rights 2030', date: '22.06.2026', 
      summary: 'RuralNexus delivered a critical whitepaper to the regional agricultural ministry regarding impending water scarcity.', 
      isHighlight: false, category: 'Policy',
      contentHTML: '<p>Drafted by the PA5 Consultancy team, this whitepaper outlines 5 immediate legislative actions required to secure equitable water distribution...</p>'
    },
    { 
      id: '7', title: 'Funding: Local Innovators Grant Launched', date: '10.07.2026', 
      summary: 'We are accepting micro-grant applications from local tech-forward farming cooperatives.', 
      isHighlight: false, category: 'Funding',
      contentHTML: '<p>In partnership with the Global Green Fund, we are disseminating €500,000 in micro-grants... </p>'
    },
    { 
      id: '8', title: 'Publication: AI in Yield Prediction', date: '05.08.2026', 
      summary: 'A critical review of the current AI models used by large agribusinesses and their inherent biases against small-holders.', 
      isHighlight: false, category: 'Publication',
      contentHTML: '<p>Machine learning models require data. Small farmers don\'t have organized data. The result is AI that optimizes for mega-farms...</p>'
    },
  ];

  async getLatestEvents(limit: number): Promise<NewsEvent[]> {
    return this.mockEvents.filter(e => !e.isHighlight).slice(0, limit);
  }

  async getHighlights(): Promise<NewsEvent[]> {
    return this.mockEvents.filter(e => e.isHighlight);
  }

  async getById(id: string): Promise<NewsEvent | null> {
    return this.mockEvents.find(e => e.id === id) || null;
  }

  async getAllByCategory(category: string): Promise<NewsEvent[]> {
    return this.mockEvents.filter(e => e.category === category);
  }
}
