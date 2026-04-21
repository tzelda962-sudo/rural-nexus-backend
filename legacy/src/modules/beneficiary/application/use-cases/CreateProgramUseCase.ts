import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Program } from "../../domain/entities/Program";
import {
  CreateProgram,
  CreateProgramInput,
  CreateProgramOutput,
} from "../../domain/ports/inbound/CreateProgram";
import { ProgramRepository } from "../../domain/ports/outbound/ProgramRepository";

export class CreateProgramUseCase implements CreateProgram {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(input: CreateProgramInput): Promise<CreateProgramOutput> {
    const program = Program.create({
      name: input.name,
      description: input.description,
      campaignId: input.campaignId
        ? UniqueId.fromString(input.campaignId)
        : undefined,
      capacity: input.capacity,
    });

    await this.programs.save(program);
    return { programId: program.id.value };
  }
}
