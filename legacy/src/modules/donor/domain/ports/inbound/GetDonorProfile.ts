export interface GetDonorProfileOutput {
  id: string;
  userId: string;
  tier: string;
  totalDonatedCents: number;
  currency: string;
  donationCount: number;
  firstDonationAt: string | null;
  lastDonationAt: string | null;
  isAnonymous: boolean;
  communicationPreferences: {
    receiveNewsletter: boolean;
    receiveUpdates: boolean;
    preferredChannel: string;
  };
}

export interface GetDonorProfile {
  execute(userId: string): Promise<GetDonorProfileOutput>;
}
