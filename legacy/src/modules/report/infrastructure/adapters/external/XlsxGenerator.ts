import ExcelJS from "exceljs";

export async function generateXlsxReport(params: {
  title: string;
  headers: string[];
  rows: Record<string, string | number>[];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NGO Platform";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(params.title.slice(0, 31));

  sheet.columns = params.headers.map((h) => ({
    header: h,
    key: h,
    width: 20,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  for (const row of params.rows) {
    const values = params.headers.map((h) => row[h] ?? "");
    sheet.addRow(values);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
