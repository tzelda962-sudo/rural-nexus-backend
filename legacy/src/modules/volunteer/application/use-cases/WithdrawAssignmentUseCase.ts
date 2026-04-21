import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  WithdrawAssignment,
  WithdrawAssignmentInput,
} from "../../domain/ports/inbound/WithdrawAssignment";
import { AssignmentRepository } from "../../domain/ports/outbound/AssignmentRepository";

export class WithdrawAssignmentUseCase implements WithdrawAssignment {
  constructor(private readonly assignments: AssignmentRepository) {}

  async execute(input: WithdrawAssignmentInput): Promise<void> {
    const assignment = await this.assignments.findById(
      UniqueId.fromString(input.assignmentId),
    );
    if (!assignment) throw new NotFoundError("Assignment", input.assignmentId);

    assignment.withdraw();
    await this.assignments.save(assignment);
  }
}
