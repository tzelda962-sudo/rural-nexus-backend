import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import {
  MAX_RETRIES,
  Notification,
} from "../../../src/modules/notification/domain/entities/Notification";
import { TemplateId } from "../../../src/modules/notification/domain/value-objects/TemplateId";

function makeNotification(): Notification {
  return Notification.create({
    recipientEmail: Email.create("donor@example.com"),
    channel: "EMAIL",
    templateId: TemplateId.DONATION_RECEIPT,
    subject: "Your donation receipt",
    body: "<p>Thank you!</p>",
    variables: { amount: "50.00", currency: "USD" },
  });
}

describe("Notification entity", () => {
  it("creates with QUEUED status", () => {
    const n = makeNotification();
    expect(n.status).toBe("QUEUED");
    expect(n.retryCount).toBe(0);
    expect(n.sentAt).toBeNull();
    expect(n.failureReason).toBeNull();
    expect(n.channel).toBe("EMAIL");
    expect(n.templateId.value).toBe("donation_receipt");
    expect(n.variables).toEqual({ amount: "50.00", currency: "USD" });
  });

  it("rejects empty subject", () => {
    expect(() =>
      Notification.create({
        recipientEmail: Email.create("test@example.com"),
        channel: "EMAIL",
        templateId: TemplateId.VOLUNTEER_WELCOME,
        subject: "",
        body: "Hello",
      }),
    ).toThrow(ValidationError);
  });

  it("rejects empty body", () => {
    expect(() =>
      Notification.create({
        recipientEmail: Email.create("test@example.com"),
        channel: "EMAIL",
        templateId: TemplateId.VOLUNTEER_WELCOME,
        subject: "Welcome",
        body: "",
      }),
    ).toThrow(ValidationError);
  });

  it("markSent transitions to SENT with timestamp", () => {
    const n = makeNotification();
    n.markSent();
    expect(n.status).toBe("SENT");
    expect(n.sentAt).toBeInstanceOf(Date);
  });

  it("markSent is idempotent on SENT", () => {
    const n = makeNotification();
    n.markSent();
    const firstSentAt = n.sentAt;
    n.markSent();
    expect(n.sentAt).toBe(firstSentAt);
  });

  it("markFailed increments retryCount and records reason", () => {
    const n = makeNotification();
    n.markFailed("SMTP timeout");
    expect(n.status).toBe("FAILED");
    expect(n.failureReason).toBe("SMTP timeout");
    expect(n.retryCount).toBe(1);
  });

  it("markFailed rejects on already-sent notification", () => {
    const n = makeNotification();
    n.markSent();
    expect(() => n.markFailed("oops")).toThrow(ConflictError);
  });

  it("canRetry returns true when under MAX_RETRIES", () => {
    const n = makeNotification();
    n.markFailed("error 1");
    expect(n.canRetry()).toBe(true);

    n.requeueForRetry();
    n.markFailed("error 2");
    expect(n.canRetry()).toBe(true);

    n.requeueForRetry();
    n.markFailed("error 3");
    expect(n.canRetry()).toBe(false);
    expect(n.retryCount).toBe(MAX_RETRIES);
  });

  it("requeueForRetry rejects when canRetry is false", () => {
    const n = makeNotification();
    for (let i = 0; i < MAX_RETRIES; i++) {
      n.markFailed(`error ${i + 1}`);
      if (i < MAX_RETRIES - 1) n.requeueForRetry();
    }
    expect(() => n.requeueForRetry()).toThrow(ConflictError);
  });

  it("markBounced sets status and reason", () => {
    const n = makeNotification();
    n.markBounced("mailbox full");
    expect(n.status).toBe("BOUNCED");
    expect(n.failureReason).toBe("mailbox full");
  });
});
