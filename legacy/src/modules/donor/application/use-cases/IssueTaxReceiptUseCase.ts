import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { DonationRepository } from "../../../donation/domain/ports/outbound/DonationRepository";
import { TaxReceipt } from "../../domain/entities/TaxReceipt";
import { DonorRepository } from "../../domain/ports/outbound/DonorRepository";
import { TaxReceiptRepository } from "../../domain/ports/outbound/TaxReceiptRepository";
import { generateTaxReceiptPdf } from "../../infrastructure/adapters/external/TaxReceiptPdfGenerator";

export interface IssueTaxReceiptInput {
  donorId: string;
  taxYear: number;
}

export interface IssueTaxReceiptOutput {
  receiptId: string;
  fileUrl: string;
  totalDeductibleCents: number;
  currency: string;
  donationCount: number;
}

export class IssueTaxReceiptUseCase {
  constructor(
    private readonly donors: DonorRepository,
    private readonly donations: DonationRepository,
    private readonly taxReceipts: TaxReceiptRepository,
    private readonly outputDir: string,
  ) {}

  async execute(input: IssueTaxReceiptInput): Promise<IssueTaxReceiptOutput> {
    const donorId = UniqueId.fromString(input.donorId);

    const donor = await this.donors.findById(donorId);
    if (!donor) throw new NotFoundError("Donor", input.donorId);

    const existing = await this.taxReceipts.findByDonorAndYear(
      donorId,
      input.taxYear,
    );
    if (existing) {
      throw new ConflictError(
        `Tax receipt already exists for year ${input.taxYear}`,
      );
    }

    const yearStart = new Date(`${input.taxYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${input.taxYear}-12-31T23:59:59Z`);

    const result = await this.donations.findByDonor(
      donor.userId,
      { page: 1, limit: 10000 },
      { status: "COMPLETED", dateFrom: yearStart, dateTo: yearEnd },
    );

    if (result.data.length === 0) {
      throw new NotFoundError("Donations for year " + input.taxYear);
    }

    const donationLines = result.data.map((d) => ({
      donationId: d.id.value,
      date: d.createdAt,
      amountCents: d.amount.amountCents,
    }));

    const receipt = TaxReceipt.create({
      donorId,
      taxYear: input.taxYear,
      currency: result.data[0]!.amount.currency,
      donations: donationLines,
    });

    const pdfBuffer = await generateTaxReceiptPdf(receipt, "Donor");

    await mkdir(this.outputDir, { recursive: true });
    const filename = `tax-receipt-${input.taxYear}-${donorId.value.slice(0, 8)}.pdf`;
    const filepath = join(this.outputDir, filename);
    await writeFile(filepath, pdfBuffer);

    const fileUrl = `file://${filepath}`;
    receipt.attachFile(fileUrl);
    await this.taxReceipts.save(receipt);

    return {
      receiptId: receipt.id.value,
      fileUrl,
      totalDeductibleCents: receipt.totalDeductibleCents,
      currency: receipt.currency,
      donationCount: receipt.donations.length,
    };
  }
}
