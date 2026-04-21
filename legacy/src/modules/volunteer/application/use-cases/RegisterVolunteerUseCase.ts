import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { PhoneNumber } from "../../../../shared/domain/value-objects/PhoneNumber";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Volunteer } from "../../domain/entities/Volunteer";
import {
  RegisterVolunteer,
  RegisterVolunteerInput,
  RegisterVolunteerOutput,
} from "../../domain/ports/inbound/RegisterVolunteer";
import { VolunteerRepository } from "../../domain/ports/outbound/VolunteerRepository";
import { Availability } from "../../domain/value-objects/Availability";
import { Proficiency, Skill } from "../../domain/value-objects/Skill";

export class RegisterVolunteerUseCase implements RegisterVolunteer {
  constructor(
    private readonly volunteers: VolunteerRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    input: RegisterVolunteerInput,
  ): Promise<RegisterVolunteerOutput> {
    const userId = UniqueId.fromString(input.userId);

    const existingByUser = await this.volunteers.findByUserId(userId);
    if (existingByUser) {
      throw new ConflictError("Volunteer profile already exists for this user");
    }

    const email = Email.create(input.email);
    const existingByEmail = await this.volunteers.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictError(
        "Volunteer profile already exists for this email",
      );
    }

    const phone = input.phone ? PhoneNumber.create(input.phone) : null;
    const skills = input.skills.map((s) =>
      Skill.create(s.name, s.proficiency as Proficiency),
    );
    const availability = Availability.create(input.availability);

    const volunteer = Volunteer.register({
      userId,
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      phone,
      skills,
      availability,
      notes: input.notes,
    });

    await this.volunteers.save(volunteer);
    await this.eventBus.publishAll(volunteer.pullEvents());

    return { volunteerId: volunteer.id.value };
  }
}
