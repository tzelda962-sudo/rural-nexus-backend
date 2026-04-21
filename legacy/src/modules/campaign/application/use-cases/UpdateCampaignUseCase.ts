import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  UpdateCampaign,
  UpdateCampaignInput,
} from "../../domain/ports/inbound/UpdateCampaign";
import { CampaignRepository } from "../../domain/ports/outbound/CampaignRepository";

export class UpdateCampaignUseCase implements UpdateCampaign {
  constructor(private readonly campaigns: CampaignRepository) {}

  async execute(input: UpdateCampaignInput): Promise<void> {
    const campaign = await this.campaigns.findById(
      UniqueId.fromString(input.campaignId),
    );
    if (!campaign) {
      throw new NotFoundError("Campaign", input.campaignId);
    }

    campaign.updateDetails({
      title: input.title,
      description: input.description,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    await this.campaigns.save(campaign);
  }
}
