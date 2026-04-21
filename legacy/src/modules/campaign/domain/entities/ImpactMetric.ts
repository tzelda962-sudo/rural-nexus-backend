import { Entity } from "../../../../shared/domain/Entity";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { MetricType } from "../value-objects/MetricType";

interface ImpactMetricProps {
  campaignId: UniqueId;
  type: MetricType;
  label: string;
  value: number;
  unit: string;
  recordedAt: Date;
  recordedBy: UniqueId;
}

export class ImpactMetric extends Entity<ImpactMetricProps> {
  static record(params: {
    campaignId: UniqueId;
    type: MetricType;
    label: string;
    value: number;
    unit: string;
    recordedBy: UniqueId;
  }): ImpactMetric {
    if (!params.label || params.label.trim().length === 0) {
      throw new ValidationError("Metric label is required");
    }
    if (params.value < 0 || !Number.isFinite(params.value)) {
      throw new ValidationError("Metric value must be a non-negative number");
    }
    if (!params.unit || params.unit.trim().length === 0) {
      throw new ValidationError("Metric unit is required");
    }

    return new ImpactMetric(UniqueId.generate(), {
      campaignId: params.campaignId,
      type: params.type,
      label: params.label.trim(),
      value: params.value,
      unit: params.unit.trim(),
      recordedAt: new Date(),
      recordedBy: params.recordedBy,
    });
  }

  static rehydrate(id: UniqueId, props: ImpactMetricProps): ImpactMetric {
    return new ImpactMetric(id, props);
  }

  get campaignId(): UniqueId {
    return this.props.campaignId;
  }
  get type(): MetricType {
    return this.props.type;
  }
  get label(): string {
    return this.props.label;
  }
  get value(): number {
    return this.props.value;
  }
  get unit(): string {
    return this.props.unit;
  }
  get recordedAt(): Date {
    return this.props.recordedAt;
  }
  get recordedBy(): UniqueId {
    return this.props.recordedBy;
  }
}
