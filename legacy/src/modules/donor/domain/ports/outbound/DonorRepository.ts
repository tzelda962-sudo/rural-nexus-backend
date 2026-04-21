import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { DonorProfile } from "../../entities/DonorProfile";

export interface DonorRepository {
  save(profile: DonorProfile): Promise<void>;
  findById(id: UniqueId): Promise<DonorProfile | null>;
  findByUserId(userId: UniqueId): Promise<DonorProfile | null>;
}
