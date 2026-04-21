export interface CreateCampaignInput {
  title: string;
  description: string;
  fundingGoalCents: number;
  currency: string;
  isFlexibleGoal: boolean;
  startDate: string;
  endDate?: string;
  tags?: string[];
  createdBy: string;
}

export interface CreateCampaignOutput {
  campaignId: string;
  slug: string;
}

export interface CreateCampaign {
  execute(input: CreateCampaignInput): Promise<CreateCampaignOutput>;
}
