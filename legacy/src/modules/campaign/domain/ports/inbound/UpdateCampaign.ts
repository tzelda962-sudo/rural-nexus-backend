export interface UpdateCampaignInput {
  campaignId: string;
  title?: string;
  description?: string;
  endDate?: string;
}

export interface UpdateCampaign {
  execute(input: UpdateCampaignInput): Promise<void>;
}
