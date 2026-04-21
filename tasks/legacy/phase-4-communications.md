# Phase 4 — Communications & Reporting

## Notification Module — Domain
- [x] `entities/Notification.ts` (create/markSent/markFailed/markBounced/canRetry/requeueForRetry)
- [x] `value-objects/NotificationChannel.ts` (EMAIL | SMS | IN_APP)
- [x] `value-objects/NotificationStatus.ts` (QUEUED | SENT | FAILED | BOUNCED)
- [x] `value-objects/TemplateId.ts` (static instances for all template types)
- [x] `ports/inbound/SendNotification.ts`
- [x] `ports/inbound/ProcessWebhook.ts`
- [x] `ports/outbound/EmailSender.ts`
- [x] `ports/outbound/SmsSender.ts`
- [x] `ports/outbound/NotificationRepository.ts`
- [x] `ports/outbound/ProcessedWebhookRepository.ts`

## Notification Module — Application
- [x] `use-cases/SendNotificationUseCase.ts` (sends EMAIL immediately, marks sent/failed)
- [x] `use-cases/ProcessPaymentWebhookUseCase.ts` (idempotent via processed_webhooks, signature verification)

## Notification Module — Infrastructure
- [x] `adapters/http/webhook.routes.ts` (POST /api/v1/webhooks/payment)
- [x] `adapters/persistence/PgNotificationRepository.ts`
- [x] `adapters/persistence/PgProcessedWebhookRepository.ts`
- [x] `adapters/external/SendGridEmailSender.ts` (circuit breaker: 5 failures → 60s open)
- [x] `adapters/external/TwilioSmsSender.ts` (circuit breaker: 5 failures → 60s open)
- [x] `adapters/external/NoopEmailSender.ts` (dev/test fallback)
- [x] `adapters/external/NoopSmsSender.ts` (dev/test fallback)
- [x] `adapters/external/StripeSignatureVerifier.ts` (+ NoopSignatureVerifier)
- [x] `notification.module.ts`
- [ ] BullMQ worker: notification queue (deferred — requires BullMQ + Redis queue setup)

## Report Module — Domain
- [x] `entities/Report.ts` (aggregate — request/markGenerating/complete/fail, 24h expiry)
- [x] `value-objects/ReportType.ts` (6 types)
- [x] `value-objects/ReportFormat.ts` (PDF | CSV | XLSX)
- [x] `ports/inbound/GenerateReport.ts`
- [x] `ports/outbound/ReportRepository.ts`
- [x] `ports/outbound/ReportExporter.ts`

## Report Module — Application
- [x] `use-cases/GenerateReportUseCase.ts` (sync for now; BullMQ deferred)
- [x] `use-cases/GetReportStatusUseCase.ts`

## Report Module — Infrastructure
- [x] `adapters/http/report.routes.ts` (POST /api/v1/reports, GET /api/v1/reports/:reportId)
- [x] `adapters/http/report.schema.ts` (Zod)
- [x] `adapters/persistence/PgReportRepository.ts`
- [x] `adapters/external/NoopReportExporter.ts` (dev/test fallback)
- [x] `report.module.ts`
- [ ] `adapters/external/PdfReportExporter.ts` (deferred — requires puppeteer/pdfkit)
- [ ] `adapters/external/CsvReportExporter.ts` (deferred — straightforward csv-stringify)
- [ ] `adapters/external/XlsxReportExporter.ts` (deferred — requires exceljs)
- [ ] BullMQ worker: report generation queue (deferred)

## SQL Migration
- [x] `0006_notifications_reports.sql`: `notifications`, `processed_webhooks`, `reports`

## Event Handlers (cross-module subscriptions)
- [x] On `DonationCompleted` → queue donation receipt email
- [x] On `VolunteerRegistered` → queue welcome email (added firstName to VolunteerRegistered event)
- [x] On `CampaignGoalReached` → log notification (full implementation deferred to BullMQ)

## Composition
- [x] Wire `notification.module` and `report.module` into `src/main.ts`
- [x] Expose `donations` repository from `donation.module` for webhook processing

## Tests
- [x] Unit: Notification entity (10 tests — create, validation, markSent idempotent, markFailed, retry logic, bounce)
- [x] Unit: ProcessPaymentWebhookUseCase (5 tests — signature rejection, idempotency, confirm, fail, unhandled)
- [x] Unit: Report aggregate (10 tests — create, validation, state transitions, rehydrate)
- [ ] Integration: Stripe webhook signature verification (deferred — needs Stripe SDK)
- [ ] E2E: duplicate webhook returns cached result (deferred — needs running server)
