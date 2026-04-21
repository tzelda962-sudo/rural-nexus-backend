import { Donation } from "../../entities/Donation";

export interface ReceiptGenerator {
  generate(donation: Donation): Promise<Buffer>;
}
