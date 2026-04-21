import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  CompleteAssignment,
  CompleteAssignmentInput,
} from "../../domain/ports/inbound/CompleteAssignment";
import { AssignmentRepository } from "../../domain/ports/outbound/AssignmentRepository";
import { VolunteerRepository } from "../../domain/ports/outbound/VolunteerRepository";

export class CompleteAssignmentUseCase implements CompleteAssignment {
  constructor(
    private readonly assignments: AssignmentRepository,
    private readonly volunteers: VolunteerRepository,
  ) {}

  async execute(input: CompleteAssignmentInput): Promise<void> {
    const assignment = await this.assignments.findById(
      UniqueId.fromString(input.assignmentId),
    );
    if (!assignment) throw new NotFoundError("Assignment", input.assignmentId);

    assignment.complete(input.hoursLogged);
    await this.assignments.save(assignment);

    const volunteer = await this.volunteers.findById(assignment.volunteerId);
    if (volunteer) {
      volunteer.logHours(input.hoursLogged);
      await this.volunteers.save(volunteer);
    }
  }
}
