import {
  PaginatedResult,
  normalizePagination,
  buildPaginatedResult,
} from "../../../../shared/application/PaginatedQuery";
import { CachePort } from "../../../../shared/infrastructure/cache/CachePort";
import {
  CampaignListItem,
  ListPublicCampaigns,
  ListPublicCampaignsInput,
} from "../../domain/ports/inbound/ListPublicCampaigns";
import { CampaignRepository } from "../../domain/ports/outbound/CampaignRepository";

const CACHE_TTL_SECONDS = 120; // 2 minutes

export class ListPublicCampaignsUseCase implements ListPublicCampaigns {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly cache: CachePort,
  ) {}

  async execute(
    input: ListPublicCampaignsInput,
  ): Promise<PaginatedResult<CampaignListItem>> {
    const pagination = normalizePagination({
      page: input.page,
      limit: input.limit,
    });

    const cacheKey = `campaigns:public:${this.buildCacheKeySuffix(input)}`;
    const cached =
      await this.cache.get<PaginatedResult<CampaignListItem>>(cacheKey);
    if (cached) return cached;

    const result = await this.campaigns.findPublished(pagination, {
      tag: input.tag,
      status: input.status,
      sort: input.sort,
    });

    const items: CampaignListItem[] = result.data.map((c) => ({
      id: c.id.value,
      title: c.title,
      slug: c.slug.value,
      description: c.description,
      coverImageUrl: c.coverImageUrl,
      fundingGoalCents: c.fundingGoal.target.amountCents,
      amountRaisedCents: c.amountRaised.amountCents,
      currency: c.fundingGoal.target.currency,
      donationCount: c.donationCount,
      progressPercentage: c.progressPercentage,
      status: c.status,
      tags: c.tags,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate?.toISOString() ?? null,
    }));

    const page = buildPaginatedResult(items, result.meta.total, pagination);
    await this.cache.set(cacheKey, page, CACHE_TTL_SECONDS);
    return page;
  }

  private buildCacheKeySuffix(input: ListPublicCampaignsInput): string {
    const parts = [`p=${input.page}`, `l=${input.limit}`];
    if (input.tag) parts.push(`tag=${input.tag}`);
    if (input.status) parts.push(`s=${input.status}`);
    if (input.sort) parts.push(`sort=${input.sort}`);
    return parts.join(":");
  }
}
