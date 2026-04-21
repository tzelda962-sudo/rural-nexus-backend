import { ProgramRepository } from "../../domain/ports/outbound/ProgramRepository";

export interface ProgramListItem {
  id: string;
  name: string;
  description: string;
  campaignId: string | null;
  capacity: number;
  enrolledCount: number;
  availableSlots: number;
  status: string;
}

export class ListProgramsUseCase {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(): Promise<ProgramListItem[]> {
    const all = await this.programs.findAll();
    return all.map((p) => ({
      id: p.id.value,
      name: p.name,
      description: p.description,
      campaignId: p.campaignId?.value ?? null,
      capacity: p.capacity,
      enrolledCount: p.enrolledCount,
      availableSlots: p.availableSlots,
      status: p.status,
    }));
  }
}
