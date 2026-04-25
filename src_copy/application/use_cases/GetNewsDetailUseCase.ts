import type { INewsEventRepository } from '../../domain/repositories/INewsEventRepository';

export class GetNewsDetailUseCase {
  constructor(private readonly newsRepo: INewsEventRepository) {}

  async execute(id: string) {
    const event = await this.newsRepo.getById(id);
    if (!event) throw new Error('Event not found');

    // Fetch related articles (same category, different ID), limited to 3
    const related = (await this.newsRepo.getAllByCategory(event.category))
      .filter(e => e.id !== id)
      .slice(0, 3);

    return {
      event,
      related
    };
  }
}
