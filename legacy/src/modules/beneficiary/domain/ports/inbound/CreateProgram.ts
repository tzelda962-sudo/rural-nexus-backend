export interface CreateProgramInput {
  name: string;
  description?: string;
  campaignId?: string;
  capacity: number;
}

export interface CreateProgramOutput {
  programId: string;
}

export interface CreateProgram {
  execute(input: CreateProgramInput): Promise<CreateProgramOutput>;
}
