# Phase 6 — Event Management (Extended)

## Event Module — Domain
- [x] `entities/Event.ts` (aggregate — publish/cancel/complete/registerAttendee/decrementRegistration)
- [x] `entities/EventRegistration.ts` (entity — create/cancel)
- [x] `value-objects/EventType.ts` (FUNDRAISER/VOLUNTEER_DRIVE/AWARENESS/COMMUNITY)
- [x] `value-objects/EventStatus.ts` (DRAFT/PUBLISHED/CANCELLED/COMPLETED)
- [x] `value-objects/EventLocation.ts` (venue + coordinates + virtual, validated)
- [x] `events/EventPublished.ts`
- [x] `events/AttendeeRegistered.ts`
- [x] `events/EventCancelled.ts`
- [x] `ports/inbound/CreateEvent.ts`
- [x] `ports/inbound/PublishEvent.ts`
- [x] `ports/inbound/CancelEvent.ts`
- [x] `ports/inbound/RegisterAttendee.ts`
- [x] `ports/inbound/CancelRegistration.ts`
- [x] `ports/inbound/ListEvents.ts`
- [x] `ports/outbound/EventRepository.ts`
- [x] `ports/outbound/EventRegistrationRepository.ts`

## Event Module — Application
- [x] `use-cases/CreateEventUseCase.ts`
- [x] `use-cases/PublishEventUseCase.ts`
- [x] `use-cases/CancelEventUseCase.ts`
- [x] `use-cases/RegisterAttendeeUseCase.ts` (enforce capacity + duplicate check)
- [x] `use-cases/CancelRegistrationUseCase.ts`
- [x] `use-cases/ListEventsUseCase.ts`

## Event Module — Infrastructure
- [x] `adapters/http/event.routes.ts` (POST/GET events, GET :slug, POST publish/cancel/register, DELETE register)
- [x] `adapters/http/event.schema.ts` (Zod — createEvent, cancel, list query, params)
- [x] `adapters/persistence/PgEventRepository.ts` (upsert, findBySlug, paginated findAll with type/status filters)
- [x] `adapters/persistence/PgEventRegistrationRepository.ts` (save, findActive, countByEvent)
- [x] `adapters/persistence/event.mapper.ts` (EventRow→Event, RegistrationRow→EventRegistration)
- [x] `event.module.ts` (wires use cases, subscribes AttendeeRegistered + EventCancelled)
- [x] SQL migration `0008_events.sql`: `events`, `event_registrations` with indexes

## Composition
- [x] Wire `event.module` into `src/main.ts`

## Cross-module
- [x] On `AttendeeRegistered` → log confirmation email (noop — ready for notification integration)
- [x] On `EventCancelled` → log attendee notification (noop — ready for notification integration)

## Tests
- [x] Unit: Event aggregate (18 tests — create/validate, publish/cancel/complete state machine, registerAttendee capacity, unlimited capacity, decrementRegistration)
- [x] Unit: EventLocation (7 tests — create, venue/address/virtual validation, coordinates range)
- [x] Unit: EventRegistration (1 test — create and cancel)
- [ ] E2E: full event registration → cancellation flow (deferred — needs running server)
