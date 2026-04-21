import { Pool } from "pg";
import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { DonorProfile } from "../../../domain/entities/DonorProfile";
import { DonorRepository } from "../../../domain/ports/outbound/DonorRepository";
import { CommunicationPreferences } from "../../../domain/value-objects/CommunicationPreferences";
import { DonorTier } from "../../../domain/value-objects/DonorTier";

interface DonorRow {
  id: string;
  user_id: string;
  tier: DonorTier;
  total_donated_cents: string | number;
  donation_count: string | number;
  first_donation_at: Date | null;
  last_donation_at: Date | null;
  is_anonymous: boolean;
  comm_prefs: {
    newsletter: boolean;
    updates: boolean;
    channel: string;
  };
  updated_at: Date;
}

function fromRow(row: DonorRow): DonorProfile {
  const prefs = row.comm_prefs ?? {
    newsletter: true,
    updates: true,
    channel: "EMAIL",
  };
  return DonorProfile.rehydrate(UniqueId.fromString(row.id), {
    userId: UniqueId.fromString(row.user_id),
    tier: row.tier,
    totalDonatedAllTime: Money.fromCents(
      Number(row.total_donated_cents),
      "USD",
    ),
    donationCount: Number(row.donation_count),
    firstDonationAt: row.first_donation_at,
    lastDonationAt: row.last_donation_at,
    isAnonymousPreferred: row.is_anonymous,
    communicationPreferences: {
      receiveNewsletter: prefs.newsletter,
      receiveUpdates: prefs.updates,
      preferredChannel: prefs.channel as CommunicationPreferences["preferredChannel"],
    },
    updatedAt: row.updated_at,
  });
}

const SELECT_COLUMNS = `id, user_id, tier, total_donated_cents, donation_count,
    first_donation_at, last_donation_at, is_anonymous, comm_prefs, updated_at`;

export class PgDonorRepository
  extends BaseRepository
  implements DonorRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(profile: DonorProfile): Promise<void> {
    const prefs = profile.communicationPreferences;
    await this.pool.query(
      `INSERT INTO donor_profiles
         (id, user_id, tier, total_donated_cents, donation_count,
          first_donation_at, last_donation_at, is_anonymous, comm_prefs, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         tier                = EXCLUDED.tier,
         total_donated_cents = EXCLUDED.total_donated_cents,
         donation_count      = EXCLUDED.donation_count,
         first_donation_at   = EXCLUDED.first_donation_at,
         last_donation_at    = EXCLUDED.last_donation_at,
         is_anonymous        = EXCLUDED.is_anonymous,
         comm_prefs          = EXCLUDED.comm_prefs,
         updated_at          = EXCLUDED.updated_at`,
      [
        profile.id.value,
        profile.userId.value,
        profile.tier,
        profile.totalDonatedAllTime.amountCents,
        profile.donationCount,
        profile.firstDonationAt,
        profile.lastDonationAt,
        profile.isAnonymousPreferred,
        JSON.stringify({
          newsletter: prefs.receiveNewsletter,
          updates: prefs.receiveUpdates,
          channel: prefs.preferredChannel,
        }),
        profile.updatedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<DonorProfile | null> {
    const row = await this.queryOne<DonorRow>(
      `SELECT ${SELECT_COLUMNS} FROM donor_profiles WHERE id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findByUserId(userId: UniqueId): Promise<DonorProfile | null> {
    const row = await this.queryOne<DonorRow>(
      `SELECT ${SELECT_COLUMNS} FROM donor_profiles WHERE user_id = $1`,
      [userId.value],
    );
    return row ? fromRow(row) : null;
  }
}
