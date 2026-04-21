import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { CampaignRepository } from "../../domain/ports/outbound/CampaignRepository";

export class PublishCampaignUseCase {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(campaignId: string): Promise<void> {
    const campaign = await this.campaigns.findById(
      UniqueId.fromString(campaignId),
    );
    if (!campaign) {
      throw new NotFoundError("Campaign", campaignId);
    }

    campaign.publish();
    await this.campaigns.save(campaign);
    await this.eventBus.publishAll(campaign.pullEvents());
  }
}
