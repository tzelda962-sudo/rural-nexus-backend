import type { IProgramAreaRepository } from '../../domain/repositories/IProgramAreaRepository';
import type { INewsEventRepository } from '../../domain/repositories/INewsEventRepository';
import type { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export class GetHomeDataUseCase {
  constructor(
    private readonly programAreaRepo: IProgramAreaRepository,
    private readonly newsEventRepo: INewsEventRepository,
    private readonly teamRepo: ITeamRepository // Might use for a "meet the team" snippet on home
  ) {}

  async execute() {
    const [programAreas, latestEvents, highlightEvents] = await Promise.all([
      this.programAreaRepo.getAll(),
      this.newsEventRepo.getLatestEvents(4),
      this.newsEventRepo.getHighlights(),
    ]);

    return {
      programAreas,
      latestEvents,
      highlightEvents,
    };
  }
}
