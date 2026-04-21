import { EventBus } from "../../../../shared/domain/events/EventBus";
import { Money } from "../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Campaign } from "../../domain/entities/Campaign";
import {
  CreateCampaign,
  CreateCampaignInput,
  CreateCampaignOutput,
} from "../../domain/ports/inbound/CreateCampaign";
import { CampaignRepository } from "../../domain/ports/outbound/CampaignRepository";
import { FundingGoal } from "../../domain/value-objects/FundingGoal";

export class CreateCampaignUseCase implements CreateCampaign {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateCampaignInput): Promise<CreateCampaignOutput> {
    const target = Money.fromCents(input.fundingGoalCents, input.currency);
    const fundingGoal = FundingGoal.create(target, input.isFlexibleGoal);

    const campaign = Campaign.create({
      title: input.title,
      description: input.description,
      fundingGoal,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      createdBy: UniqueId.fromString(input.createdBy),
      tags: input.tags,
    });

    await this.campaigns.save(campaign);
    await this.eventBus.publishAll(campaign.pullEvents());

    return {
      campaignId: campaign.id.value,
      slug: campaign.slug.value,
    };
  }
}
