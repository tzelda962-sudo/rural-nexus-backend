import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Report } from "../../../src/modules/report/domain/entities/Report";

function makeReport(): Report {
  return Report.request({
    type: "FINANCIAL_SUMMARY",
    format: "PDF",
    title: "Q1 2026 Financial Summary",
    parameters: { dateFrom: "2026-01-01", dateTo: "2026-03-31" },
    generatedBy: UniqueId.generate(),
  });
}

describe("Report aggregate", () => {
  it("creates with PENDING status and an expiry date", () => {
    const r = makeReport();
    expect(r.status).toBe("PENDING");
    expect(r.fileUrl).toBeNull();
    expect(r.generatedAt).toBeNull();
    expect(r.expiresAt).toBeInstanceOf(Date);
    expect(r.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(r.type).toBe("FINANCIAL_SUMMARY");
    expect(r.format).toBe("PDF");
  });

  it("rejects empty title", () => {
    expect(() =>
      Report.request({
        type: "DONATION_DETAIL",
        format: "CSV",
        title: "",
        generatedBy: UniqueId.generate(),
      }),
    ).toThrow(ValidationError);
  });

  it("markGenerating transitions PENDING → GENERATING", () => {
    const r = makeReport();
    r.markGenerating();
    expect(r.status).toBe("GENERATING");
  });

  it("markGenerating rejects non-PENDING reports", () => {
    const r = makeReport();
    r.markGenerating();
    expect(() => r.markGenerating()).toThrow(ConflictError);
  });

  it("complete transitions to COMPLETED with fileUrl", () => {
    const r = makeReport();
    r.markGenerating();
    r.complete("https://cdn.example.com/reports/q1.pdf");
    expect(r.status).toBe("COMPLETED");
    expect(r.fileUrl).toBe("https://cdn.example.com/reports/q1.pdf");
    expect(r.generatedAt).toBeInstanceOf(Date);
  });

  it("complete also works from PENDING", () => {
    const r = makeReport();
    r.complete("https://cdn.example.com/reports/q1.pdf");
    expect(r.status).toBe("COMPLETED");
  });

  it("complete rejects FAILED or already-COMPLETED reports", () => {
    const r = makeReport();
    r.fail("some error");
    expect(() =>
      r.complete("https://cdn.example.com/reports/q1.pdf"),
    ).toThrow(ConflictError);
  });

  it("fail transitions to FAILED with reason", () => {
    const r = makeReport();
    r.markGenerating();
    r.fail("Out of memory");
    expect(r.status).toBe("FAILED");
    expect(r.failureReason).toBe("Out of memory");
  });

  it("fail rejects already-COMPLETED reports", () => {
    const r = makeReport();
    r.complete("https://cdn.example.com/reports/q1.pdf");
    expect(() => r.fail("nope")).toThrow(ConflictError);
  });

  it("rehydrate restores without events", () => {
    const id = UniqueId.generate();
    const r = Report.rehydrate(id, {
      type: "IMPACT_SUMMARY",
      format: "XLSX",
      title: "Impact 2026",
      parameters: {},
      status: "COMPLETED",
      fileUrl: "https://cdn.example.com/impact.xlsx",
      failureReason: null,
      generatedBy: UniqueId.generate(),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    });
    expect(r.status).toBe("COMPLETED");
    expect(r.pullEvents()).toHaveLength(0);
  });
});
