import PDFDocument from "pdfkit";
import { Writable } from "node:stream";

export interface PdfTableRow {
  [key: string]: string | number;
}

export function generatePdfReport(params: {
  title: string;
  headers: string[];
  rows: PdfTableRow[];
  summary?: Record<string, string>;
}): Promise<Buffer> {
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

    doc.fontSize(18).text(params.title, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Generated: ${new Date().toISOString()}`, { align: "right" });
    doc.moveDown(2);

    if (params.summary) {
      for (const [key, value] of Object.entries(params.summary)) {
        doc.fontSize(11).text(`${key}: ${value}`);
      }
      doc.moveDown();
    }

    const colWidth = (doc.page.width - 100) / params.headers.length;
    let y = doc.y;

    doc.fontSize(9).font("Helvetica-Bold");
    params.headers.forEach((header, i) => {
      doc.text(header, 50 + i * colWidth, y, {
        width: colWidth,
        continued: false,
      });
    });
    doc.font("Helvetica");

    y = doc.y + 5;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .stroke();
    y += 5;

    for (const row of params.rows) {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }

      const values = params.headers.map(
        (h) => String(row[h] ?? ""),
      );
      values.forEach((val, i) => {
        doc.fontSize(8).text(val, 50 + i * colWidth, y, {
          width: colWidth,
          continued: false,
        });
      });
      y = doc.y + 3;
    }

    doc.end();
  });
}
