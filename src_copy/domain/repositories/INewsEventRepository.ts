export interface NewsEvent {
  id: string;
  title: string;
  date: string; // e.g., '21.01.2026'
  summary: string;
  isHighlight: boolean;
  highlightCategory?: string; // High-level flag like 'New releases'
  category: 'Publication' | 'Field Report' | 'Workshop' | 'Funding' | 'Policy';
  contentHTML?: string;
  imageUrl?: string;
}

export interface INewsEventRepository {
  getLatestEvents(limit: number): Promise<NewsEvent[]>;
  getHighlights(): Promise<NewsEvent[]>;
  getById(id: string): Promise<NewsEvent | null>;
  getAllByCategory(category: string): Promise<NewsEvent[]>;
}
