export interface TeamMember {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  avatarUrl?: string;
  bio?: string;
  expertise?: string[];
}

export interface ITeamRepository {
  getOrganigram(): Promise<TeamMember[]>;
}
