import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { TaxReceipt } from "../../entities/TaxReceipt";

export interface TaxReceiptRepository {
  save(receipt: TaxReceipt): Promise<void>;
  findByDonorAndYear(
    donorId: UniqueId,
    taxYear: number,
  ): Promise<TaxReceipt | null>;
  findByDonor(donorId: UniqueId): Promise<TaxReceipt[]>;
}
