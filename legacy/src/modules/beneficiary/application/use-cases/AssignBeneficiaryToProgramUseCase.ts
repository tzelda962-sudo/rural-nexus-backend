import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  AssignBeneficiaryToProgram,
  AssignBeneficiaryToProgramInput,
} from "../../domain/ports/inbound/AssignBeneficiaryToProgram";
import { BeneficiaryRepository } from "../../domain/ports/outbound/BeneficiaryRepository";
import { ProgramRepository } from "../../domain/ports/outbound/ProgramRepository";

export class AssignBeneficiaryToProgramUseCase
  implements AssignBeneficiaryToProgram
{
  constructor(
    private readonly beneficiaries: BeneficiaryRepository,
    private readonly programs: ProgramRepository,
  ) {}

  async execute(input: AssignBeneficiaryToProgramInput): Promise<void> {
    const beneficiaryId = UniqueId.fromString(input.beneficiaryId);
    const programId = UniqueId.fromString(input.programId);

    const beneficiary = await this.beneficiaries.findById(beneficiaryId);
    if (!beneficiary) {
      throw new NotFoundError("Beneficiary", input.beneficiaryId);
    }

    const program = await this.programs.findById(programId);
    if (!program) {
      throw new NotFoundError("Program", input.programId);
    }

    program.enrollOne();
    beneficiary.assignToProgram(programId);

    await this.programs.save(program);
    await this.beneficiaries.save(beneficiary);
    await this.beneficiaries.addProgramAssignment(beneficiaryId, programId);
  }
}
