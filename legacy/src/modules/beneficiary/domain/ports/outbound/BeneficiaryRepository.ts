import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Beneficiary } from "../../entities/Beneficiary";
import { BeneficiaryStatus } from "../../value-objects/BeneficiaryStatus";

export interface BeneficiaryRepository {
  save(beneficiary: Beneficiary): Promise<void>;
  findById(id: UniqueId): Promise<Beneficiary | null>;
  findAll(
    pagination: PaginationParams,
    filters?: { status?: BeneficiaryStatus; programId?: string },
  ): Promise<PaginatedResult<Beneficiary>>;
  addProgramAssignment(
    beneficiaryId: UniqueId,
    programId: UniqueId,
  ): Promise<void>;
}
