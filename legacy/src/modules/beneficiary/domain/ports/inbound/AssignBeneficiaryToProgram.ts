export interface AssignBeneficiaryToProgramInput {
  beneficiaryId: string;
  programId: string;
}

export interface AssignBeneficiaryToProgram {
  execute(input: AssignBeneficiaryToProgramInput): Promise<void>;
}
