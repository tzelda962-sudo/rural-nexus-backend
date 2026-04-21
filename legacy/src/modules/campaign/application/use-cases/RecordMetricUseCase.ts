import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { ImpactMetric } from "../../domain/entities/ImpactMetric";
import { metricRecorded } from "../../domain/events/MetricRecorded";
import {
  RecordMetric,
  RecordMetricInput,
  RecordMetricOutput,
} from "../../domain/ports/inbound/RecordMetric";
import { CampaignRepository } from "../../domain/ports/outbound/CampaignRepository";
import { MetricRepository } from "../../domain/ports/outbound/MetricRepository";
import { isMetricType, MetricType } from "../../domain/value-objects/MetricType";

export class RecordMetricUseCase implements RecordMetric {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly metrics: MetricRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: RecordMetricInput): Promise<RecordMetricOutput> {
    if (!isMetricType(input.type)) {
      throw new ValidationError(`Invalid metric type: ${input.type}`);
    }

    const campaign = await this.campaigns.findById(
      UniqueId.fromString(input.campaignId),
    );
    if (!campaign) {
      throw new NotFoundError("Campaign", input.campaignId);
    }

    const metric = ImpactMetric.record({
      campaignId: campaign.id,
      type: input.type as MetricType,
      label: input.label,
      value: input.value,
      unit: input.unit,
      recordedBy: UniqueId.fromString(input.recordedBy),
    });

    await this.metrics.save(metric);

    await this.eventBus.publish(
      metricRecorded({
        metricId: metric.id.value,
        campaignId: campaign.id.value,
        type: metric.type,
        label: metric.label,
        value: metric.value,
        unit: metric.unit,
      }),
    );

    return { metricId: metric.id.value };
  }
}
