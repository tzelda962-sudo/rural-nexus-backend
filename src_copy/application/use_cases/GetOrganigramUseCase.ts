import type { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export class GetOrganigramUseCase {
  constructor(private readonly teamRepo: ITeamRepository) {}

  async execute() {
    const teamMembers = await this.teamRepo.getOrganigram();
    
    // Convert flat list into a hierarchical tree Structure
    const root = teamMembers.find(m => m.parentId === null);
    
    const buildTree = (parentId: string | null): any[] => {
      return teamMembers
        .filter(m => m.parentId === parentId)
        .map(m => ({
          ...m,
          children: buildTree(m.id)
        }));
    };

    if (root) {
      return [{ ...root, children: buildTree(root.id) }];
    }
    return [];
  }
}
