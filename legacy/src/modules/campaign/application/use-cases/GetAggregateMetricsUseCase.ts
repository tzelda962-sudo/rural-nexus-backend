import { CachePort } from "../../../../shared/infrastructure/cache/CachePort";
import {
  GetAggregateMetrics,
  GetAggregateMetricsInput,
  GetAggregateMetricsOutput,
} from "../../domain/ports/inbound/GetAggregateMetrics";
import { MetricRepository } from "../../domain/ports/outbound/MetricRepository";
import { isMetricType, MetricType } from "../../domain/value-objects/MetricType";

const CACHE_TTL_SECONDS = 300; // 5 minutes

export class GetAggregateMetricsUseCase implements GetAggregateMetrics {
  constructor(
    private readonly metrics: MetricRepository,
    private readonly cache: CachePort,
  ) {}

  async execute(
    input: GetAggregateMetricsInput,
  ): Promise<GetAggregateMetricsOutput> {
    const cacheKey = `metrics:aggregate:${this.buildCacheKeySuffix(input)}`;

    const cached = await this.cache.get<GetAggregateMetricsOutput>(cacheKey);
    if (cached) return cached;

    const types = input.types?.filter(isMetricType) as
      | MetricType[]
      | undefined;

    const [global, byCampaign] = await Promise.all([
      this.metrics.globalSummary(),
      this.metrics.aggregate({
        campaignIds: input.campaignIds,
        types,
      }),
    ]);

    const result: GetAggregateMetricsOutput = { global, byCampaign };
    await this.cache.set(cacheKey, result, CACHE_TTL_SECONDS);
    return result;
  }

  private buildCacheKeySuffix(input: GetAggregateMetricsInput): string {
    const parts: string[] = [];
    if (input.campaignIds?.length) {
      parts.push(`c=${input.campaignIds.sort().join(",")}`);
    }
    if (input.types?.length) {
      parts.push(`t=${input.types.sort().join(",")}`);
    }
    return parts.length > 0 ? parts.join(":") : "all";
  }
}
