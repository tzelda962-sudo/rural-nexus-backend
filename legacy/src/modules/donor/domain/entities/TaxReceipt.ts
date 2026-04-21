import { Entity } from "../../../../shared/domain/Entity";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";

interface DonationLineItem {
  donationId: string;
  date: Date;
  amountCents: number;
}

interface TaxReceiptProps {
  donorId: UniqueId;
  taxYear: number;
  totalDeductibleCents: number;
  currency: string;
  donations: DonationLineItem[];
  fileUrl: string | null;
  generatedAt: Date;
}

export class TaxReceipt extends Entity<TaxReceiptProps> {
  static create(params: {
    donorId: UniqueId;
    taxYear: number;
    currency: string;
    donations: DonationLineItem[];
  }): TaxReceipt {
    if (params.taxYear < 2000 || params.taxYear > 2100) {
      throw new ValidationError(`Invalid tax year: ${params.taxYear}`);
    }
    if (params.donations.length === 0) {
      throw new ValidationError("Tax receipt requires at least one donation");
    }

    const totalDeductibleCents = params.donations.reduce(
      (sum, d) => sum + d.amountCents,
      0,
    );

    return new TaxReceipt(UniqueId.generate(), {
      donorId: params.donorId,
      taxYear: params.taxYear,
      totalDeductibleCents,
      currency: params.currency,
      donations: [...params.donations],
      fileUrl: null,
      generatedAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: TaxReceiptProps): TaxReceipt {
    return new TaxReceipt(id, props);
  }

  attachFile(url: string): void {
    this.props.fileUrl = url;
  }

  get donorId(): UniqueId {
    return this.props.donorId;
  }
  get taxYear(): number {
    return this.props.taxYear;
  }
  get totalDeductibleCents(): number {
    return this.props.totalDeductibleCents;
  }
  get currency(): string {
    return this.props.currency;
  }
  get donations(): DonationLineItem[] {
    return [...this.props.donations];
  }
  get fileUrl(): string | null {
    return this.props.fileUrl;
  }
  get generatedAt(): Date {
    return this.props.generatedAt;
  }
}
