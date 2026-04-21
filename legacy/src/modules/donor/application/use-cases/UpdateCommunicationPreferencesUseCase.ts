import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  UpdateCommunicationPreferences,
  UpdateCommunicationPreferencesInput,
} from "../../domain/ports/inbound/UpdateCommunicationPreferences";
import { DonorRepository } from "../../domain/ports/outbound/DonorRepository";
import { isNotificationChannel } from "../../../notification/domain/value-objects/NotificationChannel";

export class UpdateCommunicationPreferencesUseCase
  implements UpdateCommunicationPreferences
{
  constructor(private readonly donors: DonorRepository) {}

  async execute(input: UpdateCommunicationPreferencesInput): Promise<void> {
    if (
      input.preferredChannel !== undefined &&
      !isNotificationChannel(input.preferredChannel)
    ) {
      throw new ValidationError(
        `Invalid channel: ${input.preferredChannel}`,
      );
    }

    const profile = await this.donors.findByUserId(
      UniqueId.fromString(input.userId),
    );
    if (!profile) {
      throw new NotFoundError("DonorProfile", input.userId);
    }

    profile.updateCommunicationPreferences({
      receiveNewsletter: input.receiveNewsletter,
      receiveUpdates: input.receiveUpdates,
      preferredChannel: input.preferredChannel as
        | "EMAIL"
        | "SMS"
        | "IN_APP"
        | undefined,
    });

    await this.donors.save(profile);
  }
}
