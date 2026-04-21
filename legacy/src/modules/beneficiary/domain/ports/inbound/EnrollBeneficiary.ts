export interface EnrollBeneficiaryInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  location: string;
  notes?: string;
}

export interface EnrollBeneficiaryOutput {
  beneficiaryId: string;
}

export interface EnrollBeneficiary {
  execute(input: EnrollBeneficiaryInput): Promise<EnrollBeneficiaryOutput>;
}
