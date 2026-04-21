import { Beneficiary } from "../../domain/entities/Beneficiary";
import {
  EnrollBeneficiary,
  EnrollBeneficiaryInput,
  EnrollBeneficiaryOutput,
} from "../../domain/ports/inbound/EnrollBeneficiary";
import { BeneficiaryRepository } from "../../domain/ports/outbound/BeneficiaryRepository";

export class EnrollBeneficiaryUseCase implements EnrollBeneficiary {
  constructor(private readonly beneficiaries: BeneficiaryRepository) {}

  async execute(
    input: EnrollBeneficiaryInput,
  ): Promise<EnrollBeneficiaryOutput> {
    const beneficiary = Beneficiary.enroll({
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth
        ? new Date(input.dateOfBirth)
        : undefined,
      location: input.location,
      notes: input.notes,
    });

    await this.beneficiaries.save(beneficiary);
    return { beneficiaryId: beneficiary.id.value };
  }
}
