import { stringify } from "csv-stringify/sync";

export function generateCsvReport(params: {
  headers: string[];
  rows: Record<string, string | number>[];
}): Buffer {
  const records = params.rows.map((row) =>
    params.headers.map((h) => row[h] ?? ""),
  );
  const csv = stringify([params.headers, ...records]);
  return Buffer.from(csv, "utf-8");
}
