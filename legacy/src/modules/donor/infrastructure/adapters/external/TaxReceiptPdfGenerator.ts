import PDFDocument from "pdfkit";
import { Writable } from "node:stream";
import { TaxReceipt } from "../../../domain/entities/TaxReceipt";

export function generateTaxReceiptPdf(
  receipt: TaxReceipt,
  donorName: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    const writable = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    writable.on("finish", () => resolve(Buffer.concat(chunks)));
    writable.on("error", reject);
    doc.pipe(writable);

    doc.fontSize(20).text("Tax Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Tax Year: ${receipt.taxYear}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(11);
    doc.text(`Donor: ${donorName}`);
    doc.text(`Receipt ID: ${receipt.id.value}`);
    doc.text(`Generated: ${receipt.generatedAt.toISOString().slice(0, 10)}`);
    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        `Total Deductible: ${(receipt.totalDeductibleCents / 100).toFixed(2)} ${receipt.currency}`,
      );
    doc.font("Helvetica");
    doc.moveDown(2);

    doc.fontSize(10).font("Helvetica-Bold");
    const colDate = 50;
    const colId = 170;
    const colAmount = 400;
    let y = doc.y;

    doc.text("Date", colDate, y);
    doc.text("Donation ID", colId, y);
    doc.text("Amount", colAmount, y);
    doc.font("Helvetica");

    y += 20;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .stroke();
    y += 5;

    for (const donation of receipt.donations) {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }

      doc
        .fontSize(9)
        .text(donation.date.toISOString().slice(0, 10), colDate, y);
      doc.text(donation.donationId.slice(0, 8) + "...", colId, y);
      doc.text(
        `${(donation.amountCents / 100).toFixed(2)} ${receipt.currency}`,
        colAmount,
        y,
      );
      y += 18;
    }

    doc.moveDown(3);
    doc
      .fontSize(8)
      .fillColor("gray")
      .text(
        "This receipt is issued for tax deduction purposes. Please retain for your records.",
        50,
        doc.page.height - 80,
        { align: "center" },
      );

    doc.end();
  });
}
