import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { VolunteerAssignment } from "../../domain/entities/VolunteerAssignment";
import {
  AssignVolunteer,
  AssignVolunteerInput,
  AssignVolunteerOutput,
} from "../../domain/ports/inbound/AssignVolunteer";
import { AssignmentRepository } from "../../domain/ports/outbound/AssignmentRepository";
import { VolunteerRepository } from "../../domain/ports/outbound/VolunteerRepository";
import { volunteerAssigned } from "../../domain/events/VolunteerAssigned";

export class AssignVolunteerUseCase implements AssignVolunteer {
  constructor(
    private readonly volunteers: VolunteerRepository,
    private readonly assignments: AssignmentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: AssignVolunteerInput): Promise<AssignVolunteerOutput> {
    const volunteerId = UniqueId.fromString(input.volunteerId);
    const campaignId = UniqueId.fromString(input.campaignId);

    const volunteer = await this.volunteers.findById(volunteerId);
    if (!volunteer) throw new NotFoundError("Volunteer", input.volunteerId);

    if (volunteer.status !== "ACTIVE") {
      throw new ConflictError("Volunteer must be ACTIVE to be assigned");
    }

    const existing = await this.assignments.findActiveByVolunteerAndCampaign(
      volunteerId,
      campaignId,
    );
    if (existing) {
      throw new ConflictError("Volunteer already assigned to this campaign");
    }

    const assignment = VolunteerAssignment.create({
      volunteerId,
      campaignId,
      role: input.role,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      hoursCommitted: input.hoursCommitted,
    });

    await this.assignments.save(assignment);
    await this.eventBus.publish(
      volunteerAssigned({
        volunteerId: volunteerId.value,
        campaignId: campaignId.value,
        role: input.role,
      }),
    );

    return { assignmentId: assignment.id.value };
  }
}
