import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  UpdateAvailability,
  UpdateAvailabilityInput,
  UpdateAvailabilityOutput,
} from "../../domain/ports/inbound/UpdateAvailability";
import { VolunteerRepository } from "../../domain/ports/outbound/VolunteerRepository";
import { Availability } from "../../domain/value-objects/Availability";

export class UpdateAvailabilityUseCase implements UpdateAvailability {
  constructor(private readonly volunteers: VolunteerRepository) {}

  async execute(
    input: UpdateAvailabilityInput,
  ): Promise<UpdateAvailabilityOutput> {
    const volunteer = await this.volunteers.findById(
      UniqueId.fromString(input.volunteerId),
    );
    if (!volunteer) {
      throw new NotFoundError("Volunteer", input.volunteerId);
    }

    volunteer.updateAvailability(Availability.create(input.availability));
    await this.volunteers.save(volunteer);

    return { volunteerId: volunteer.id.value };
  }
}
