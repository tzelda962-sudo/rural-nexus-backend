import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  GetDonorProfile,
  GetDonorProfileOutput,
} from "../../domain/ports/inbound/GetDonorProfile";
import { DonorRepository } from "../../domain/ports/outbound/DonorRepository";

export class GetDonorProfileUseCase implements GetDonorProfile {
  constructor(private readonly donors: DonorRepository) {}

  async execute(userId: string): Promise<GetDonorProfileOutput> {
    const profile = await this.donors.findByUserId(
      UniqueId.fromString(userId),
    );
    if (!profile) {
      throw new NotFoundError("DonorProfile", userId);
    }

    return {
      id: profile.id.value,
      userId: profile.userId.value,
      tier: profile.tier,
      totalDonatedCents: profile.totalDonatedAllTime.amountCents,
      currency: profile.totalDonatedAllTime.currency,
      donationCount: profile.donationCount,
      firstDonationAt: profile.firstDonationAt?.toISOString() ?? null,
      lastDonationAt: profile.lastDonationAt?.toISOString() ?? null,
      isAnonymous: profile.isAnonymousPreferred,
      communicationPreferences: profile.communicationPreferences,
    };
  }
}
