# Phase 1 — Core Operations: Donations & Volunteers

## Donation Module — Domain
- [x] `entities/Donation.ts` (aggregate root — createIntent/attach/confirm/fail/refund/cancel)
- [ ] `entities/RecurringPlan.ts` (table seeded; entity deferred until billing automation lands)
- [x] `value-objects/DonationAmount.ts` (using shared `Money` VO)
- [x] `value-objects/DonationStatus.ts`
- [x] `value-objects/DonationFrequency.ts`
- [x] `value-objects/PaymentMethod.ts`
- [x] `events/DonationCreated.ts`
- [x] `events/DonationCompleted.ts`
- [x] `events/DonationFailed.ts`
- [x] `events/DonationRefunded.ts`
- [x] `ports/inbound/CreateDonationIntent.ts`
- [x] `ports/inbound/ConfirmDonation.ts`
- [x] `ports/inbound/GetDonationHistory.ts`
- [x] `ports/inbound/RefundDonation.ts`
- [ ] `ports/inbound/CancelRecurringPlan.ts` (deferred with RecurringPlan)
- [x] `ports/outbound/DonationRepository.ts`
- [x] `ports/outbound/PaymentGateway.ts`
- [x] `ports/outbound/ReceiptGenerator.ts`

## Donation Module — Application
- [x] `use-cases/CreateDonationIntentUseCase.ts` (idempotent on idempotencyKey)
- [x] `use-cases/ConfirmDonationUseCase.ts`
- [x] `use-cases/GetDonationHistoryUseCase.ts`
- [x] `use-cases/RefundDonationUseCase.ts`
- [ ] `use-cases/CancelRecurringPlanUseCase.ts` (deferred)
- [x] `dtos/DonationResponseDto.ts`

## Donation Module — Infrastructure
- [x] `adapters/http/donation.routes.ts` (intent, confirm, get, list, refund)
- [x] `adapters/http/donation.schema.ts` (Zod)
- [x] `adapters/persistence/PgDonationRepository.ts` (idempotency lookup, donor history, sumByCampaign)
- [x] `adapters/persistence/donation.mapper.ts`
- [x] `adapters/external/StripePaymentGateway.ts`
- [x] `adapters/external/NoopPaymentGateway.ts` (dev/test fallback when STRIPE_SECRET_KEY unset)
- [ ] `adapters/external/PdfReceiptGenerator.ts` (deferred — Phase 4 communications)
- [x] `donation.module.ts`
- [x] SQL migration `0003_donations.sql`: `donations`, `recurring_plans`

## Volunteer Module — Domain
- [x] `entities/Volunteer.ts` (register/updateAvailability/skills/status/logHours)
- [ ] `entities/VolunteerAssignment.ts` (table seeded; entity deferred until campaigns ship)
- [x] `value-objects/Skill.ts`
- [x] `value-objects/Availability.ts`
- [x] `value-objects/VolunteerStatus.ts`
- [x] `events/VolunteerRegistered.ts`
- [x] `events/VolunteerAssigned.ts`
- [x] `ports/inbound/RegisterVolunteer.ts`
- [x] `ports/inbound/UpdateAvailability.ts`
- [x] `ports/inbound/SearchVolunteers.ts`
- [ ] `ports/inbound/AssignVolunteer.ts` (deferred — needs campaigns)
- [x] `ports/outbound/VolunteerRepository.ts`

## Volunteer Module — Application
- [x] `use-cases/RegisterVolunteerUseCase.ts` (rejects duplicate user/email)
- [x] `use-cases/UpdateAvailabilityUseCase.ts`
- [x] `use-cases/SearchVolunteersUseCase.ts`
- [ ] `use-cases/AssignVolunteerUseCase.ts` (deferred)
- [x] `dtos/VolunteerResponseDto.ts`

## Volunteer Module — Infrastructure
- [x] `adapters/http/volunteer.routes.ts` (register, search, get, update availability)
- [x] `adapters/http/volunteer.schema.ts` (Zod)
- [x] `adapters/persistence/PgVolunteerRepository.ts` (skills GIN search)
- [x] `adapters/persistence/volunteer.mapper.ts`
- [x] `volunteer.module.ts`
- [x] SQL migration `0004_volunteers.sql`: `volunteers`, `volunteer_assignments`

## Composition
- [x] Wire `donation.module` and `volunteer.module` into `src/main.ts`

## Tests
- [x] Unit: Donation entity (createIntent, attach, confirm idempotency, fail, refund, conflict guards)
- [x] Unit: Volunteer entity (register, dedupe skills, addSkill/removeSkill, status transitions, logHours)
- [x] Unit: CreateDonationIntentUseCase (idempotency replay, currency rejection)
- [ ] Integration: PgDonationRepository CRUD (testcontainers — deferred, needs Docker)
- [ ] Integration: PgVolunteerRepository CRUD + skill search
- [ ] E2E: POST /donations/intent happy path + duplicate idempotency key
- [ ] E2E: POST /volunteers register + search
