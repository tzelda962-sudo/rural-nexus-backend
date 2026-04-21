# NGO Platform — Backend Architectural Blueprint

**Stack:** Node.js · TypeScript · PostgreSQL · Redis · Hexagonal Architecture
**Deployment Target:** Render (Web Service + PostgreSQL + Redis)

---

## Table of Contents

1. [Global Directory Structure](#1-global-directory-structure)
2. [Shared Kernel & Foundational Types](#2-shared-kernel--foundational-types)
3. [Phase 1: Core Operations — Donations & Volunteers](#3-phase-1-core-operations)
4. [Phase 2: Identity & Access Management](#4-phase-2-iam)
5. [Phase 3: Content & Campaign Management](#5-phase-3-campaigns--impact)
6. [Phase 4: Communications & Reporting](#6-phase-4-communications--reporting)
7. [Phase 5: Donor & Beneficiary Management (Extended)](#7-phase-5-donor--beneficiary-management)
8. [Phase 6: Event Management (Extended)](#8-phase-6-event-management)
9. [Security, Performance & Infrastructure](#9-security-performance--infrastructure)
10. [Render Deployment Configuration](#10-render-deployment-configuration)
11. [Database Schema Overview](#11-database-schema-overview)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. Global Directory Structure

```
ngo-platform/
├── src/
│   ├── shared/                          # ── Shared Kernel ──
│   │   ├── domain/
│   │   │   ├── value-objects/
│   │   │   │   ├── UniqueId.ts          # UUID wrapper
│   │   │   │   ├── Email.ts             # Self-validating email VO
│   │   │   │   ├── Money.ts             # Currency-safe monetary VO
│   │   │   │   ├── PhoneNumber.ts
│   │   │   │   ├── DateRange.ts
│   │   │   │   └── Slug.ts
│   │   │   ├── errors/
│   │   │   │   ├── DomainError.ts       # Base domain error
│   │   │   │   ├── NotFoundError.ts
│   │   │   │   ├── ConflictError.ts
│   │   │   │   ├── ValidationError.ts
│   │   │   │   └── AuthorizationError.ts
│   │   │   ├── events/
│   │   │   │   ├── DomainEvent.ts       # Base event interface
│   │   │   │   └── EventBus.ts          # Event bus port
│   │   │   ├── Entity.ts                # Base entity with ID + equality
│   │   │   ├── AggregateRoot.ts         # Entity + domain events collection
│   │   │   └── ValueObject.ts           # Base VO with structural equality
│   │   ├── application/
│   │   │   ├── UseCase.ts               # Generic use-case interface
│   │   │   ├── PaginatedQuery.ts        # Pagination input/output types
│   │   │   └── TransactionManager.ts    # Unit-of-work port
│   │   └── infrastructure/
│   │       ├── config/
│   │       │   ├── env.ts               # Env var loader + Zod validation
│   │       │   └── container.ts         # DI container setup (tsyringe)
│   │       ├── database/
│   │       │   ├── pg-pool.ts           # PostgreSQL connection pool
│   │       │   ├── migrations/          # SQL migration files
│   │       │   ├── seeds/               # Seed data
│   │       │   └── repositories/
│   │       │       └── BaseRepository.ts
│   │       ├── http/
│   │       │   ├── server.ts            # Fastify bootstrap
│   │       │   ├── plugins/
│   │       │   │   ├── auth.plugin.ts   # JWT verification decorator
│   │       │   │   ├── rbac.plugin.ts   # Role guard decorator
│   │       │   │   ├── rate-limit.plugin.ts
│   │       │   │   └── error-handler.plugin.ts
│   │       │   └── middleware/
│   │       │       ├── request-id.ts
│   │       │       ├── cors.ts
│   │       │       └── helmet.ts
│   │       ├── cache/
│   │       │   ├── redis-client.ts
│   │       │   └── CachePort.ts         # Cache abstraction port
│   │       ├── logging/
│   │       │   └── pino-logger.ts
│   │       ├── events/
│   │       │   └── InMemoryEventBus.ts  # Dev event bus, swap for Redis pub/sub later
│   │       └── jobs/
│   │           ├── queue.ts             # BullMQ queue setup
│   │           └── workers/             # Background job processors
│   │
│   ├── modules/                         # ── Bounded Contexts ──
│   │   ├── donation/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Donation.ts
│   │   │   │   │   └── RecurringPlan.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── DonationAmount.ts
│   │   │   │   │   ├── DonationStatus.ts
│   │   │   │   │   ├── PaymentMethod.ts
│   │   │   │   │   └── DonationFrequency.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── DonationCreated.ts
│   │   │   │   │   ├── DonationCompleted.ts
│   │   │   │   │   └── RecurringPlanActivated.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── CreateDonationIntent.ts
│   │   │   │       │   ├── ConfirmDonation.ts
│   │   │   │       │   ├── GetDonationHistory.ts
│   │   │   │       │   └── CancelRecurringPlan.ts
│   │   │   │       └── outbound/
│   │   │   │           ├── DonationRepository.ts
│   │   │   │           ├── PaymentGateway.ts
│   │   │   │           └── ReceiptGenerator.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── CreateDonationIntentUseCase.ts
│   │   │   │   │   ├── ConfirmDonationUseCase.ts
│   │   │   │   │   ├── GetDonationHistoryUseCase.ts
│   │   │   │   │   └── CancelRecurringPlanUseCase.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── CreateDonationIntentDto.ts
│   │   │   │       └── DonationResponseDto.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── donation.routes.ts
│   │   │       │   │   ├── donation.controller.ts
│   │   │       │   │   └── donation.schema.ts  # Zod request schemas
│   │   │       │   ├── persistence/
│   │   │       │   │   ├── PgDonationRepository.ts
│   │   │       │   │   └── donation.mapper.ts
│   │   │       │   └── external/
│   │   │       │       ├── StripePaymentGateway.ts
│   │   │       │       └── PdfReceiptGenerator.ts
│   │   │       └── donation.module.ts   # Module registration
│   │   │
│   │   ├── volunteer/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Volunteer.ts
│   │   │   │   │   └── VolunteerAssignment.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── Skill.ts
│   │   │   │   │   ├── Availability.ts
│   │   │   │   │   └── VolunteerStatus.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── VolunteerRegistered.ts
│   │   │   │   │   └── VolunteerAssigned.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── RegisterVolunteer.ts
│   │   │   │       │   ├── UpdateAvailability.ts
│   │   │   │       │   ├── AssignVolunteer.ts
│   │   │   │       │   └── SearchVolunteers.ts
│   │   │   │       └── outbound/
│   │   │   │           └── VolunteerRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── RegisterVolunteerUseCase.ts
│   │   │   │   │   ├── UpdateAvailabilityUseCase.ts
│   │   │   │   │   ├── AssignVolunteerUseCase.ts
│   │   │   │   │   └── SearchVolunteersUseCase.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── RegisterVolunteerDto.ts
│   │   │   │       └── VolunteerResponseDto.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── volunteer.routes.ts
│   │   │       │   │   ├── volunteer.controller.ts
│   │   │       │   │   └── volunteer.schema.ts
│   │   │       │   └── persistence/
│   │   │       │       ├── PgVolunteerRepository.ts
│   │   │       │       └── volunteer.mapper.ts
│   │   │       └── volunteer.module.ts
│   │   │
│   │   ├── iam/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── User.ts
│   │   │   │   │   ├── Role.ts
│   │   │   │   │   └── AuditLogEntry.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── HashedPassword.ts
│   │   │   │   │   ├── Permission.ts
│   │   │   │   │   ├── SessionToken.ts
│   │   │   │   │   └── RoleName.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── UserCreated.ts
│   │   │   │   │   ├── UserLoggedIn.ts
│   │   │   │   │   └── PermissionChanged.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── LoginUser.ts
│   │   │   │       │   ├── RegisterUser.ts
│   │   │   │       │   ├── RefreshToken.ts
│   │   │   │       │   ├── AssignRole.ts
│   │   │   │       │   └── GetAuditLogs.ts
│   │   │   │       └── outbound/
│   │   │   │           ├── UserRepository.ts
│   │   │   │           ├── TokenService.ts
│   │   │   │           ├── PasswordHasher.ts
│   │   │   │           └── AuditLogRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── LoginUserUseCase.ts
│   │   │   │   │   ├── RegisterUserUseCase.ts
│   │   │   │   │   ├── RefreshTokenUseCase.ts
│   │   │   │   │   ├── AssignRoleUseCase.ts
│   │   │   │   │   └── GetAuditLogsUseCase.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── LoginDto.ts
│   │   │   │       ├── RegisterDto.ts
│   │   │   │       └── AuthResponseDto.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── auth.routes.ts
│   │   │       │   │   ├── admin.routes.ts
│   │   │       │   │   ├── auth.controller.ts
│   │   │       │   │   └── auth.schema.ts
│   │   │       │   ├── persistence/
│   │   │       │   │   ├── PgUserRepository.ts
│   │   │       │   │   ├── PgAuditLogRepository.ts
│   │   │       │   │   └── user.mapper.ts
│   │   │       │   └── external/
│   │   │       │       ├── BcryptPasswordHasher.ts
│   │   │       │       └── JwtTokenService.ts
│   │   │       └── iam.module.ts
│   │   │
│   │   ├── campaign/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Campaign.ts
│   │   │   │   │   ├── ImpactMetric.ts
│   │   │   │   │   └── CampaignUpdate.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── FundingGoal.ts
│   │   │   │   │   ├── CampaignStatus.ts
│   │   │   │   │   └── MetricType.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── CampaignCreated.ts
│   │   │   │   │   ├── CampaignGoalReached.ts
│   │   │   │   │   └── MetricRecorded.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── CreateCampaign.ts
│   │   │   │       │   ├── UpdateCampaign.ts
│   │   │   │       │   ├── RecordMetric.ts
│   │   │   │       │   ├── GetAggregateMetrics.ts
│   │   │   │       │   └── ListPublicCampaigns.ts
│   │   │   │       └── outbound/
│   │   │   │           ├── CampaignRepository.ts
│   │   │   │           ├── MetricRepository.ts
│   │   │   │           └── MediaStorage.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── CreateCampaignUseCase.ts
│   │   │   │   │   ├── UpdateCampaignUseCase.ts
│   │   │   │   │   ├── RecordMetricUseCase.ts
│   │   │   │   │   ├── GetAggregateMetricsUseCase.ts
│   │   │   │   │   └── ListPublicCampaignsUseCase.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── CreateCampaignDto.ts
│   │   │   │       ├── CampaignResponseDto.ts
│   │   │   │       └── MetricAggregateDto.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── campaign.routes.ts
│   │   │       │   │   ├── metrics.routes.ts
│   │   │       │   │   ├── campaign.controller.ts
│   │   │       │   │   └── campaign.schema.ts
│   │   │       │   ├── persistence/
│   │   │       │   │   ├── PgCampaignRepository.ts
│   │   │       │   │   ├── PgMetricRepository.ts
│   │   │       │   │   └── campaign.mapper.ts
│   │   │       │   └── external/
│   │   │       │       └── S3MediaStorage.ts
│   │   │       └── campaign.module.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── Notification.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── NotificationChannel.ts  # EMAIL | SMS | PUSH
│   │   │   │   │   ├── NotificationStatus.ts
│   │   │   │   │   └── TemplateId.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── SendNotification.ts
│   │   │   │       │   └── ProcessWebhook.ts
│   │   │   │       └── outbound/
│   │   │   │           ├── EmailSender.ts
│   │   │   │           ├── SmsSender.ts
│   │   │   │           └── NotificationRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── SendNotificationUseCase.ts
│   │   │   │   │   └── ProcessPaymentWebhookUseCase.ts
│   │   │   │   └── dtos/
│   │   │   │       └── WebhookPayloadDto.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── webhook.routes.ts
│   │   │       │   │   └── webhook.controller.ts
│   │   │       │   ├── persistence/
│   │   │       │   │   └── PgNotificationRepository.ts
│   │   │       │   └── external/
│   │   │       │       ├── SendGridEmailSender.ts
│   │   │       │       └── TwilioSmsSender.ts
│   │   │       └── notification.module.ts
│   │   │
│   │   ├── report/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── Report.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── ReportType.ts   # FINANCIAL | IMPACT | DONOR_SUMMARY
│   │   │   │   │   └── ReportFormat.ts # PDF | CSV | JSON
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── GenerateReport.ts
│   │   │   │       │   └── ScheduleReport.ts
│   │   │   │       └── outbound/
│   │   │   │           ├── ReportRepository.ts
│   │   │   │           └── ReportExporter.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── GenerateReportUseCase.ts
│   │   │   │       └── ScheduleReportUseCase.ts
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── http/
│   │   │       │   │   ├── report.routes.ts
│   │   │       │   │   └── report.controller.ts
│   │   │       │   ├── persistence/
│   │   │       │   │   └── PgReportRepository.ts
│   │   │       │   └── external/
│   │   │       │       └── PdfReportExporter.ts
│   │   │       └── report.module.ts
│   │   │
│   │   ├── donor/                       # ── Extended: Phase 5 ──
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── DonorProfile.ts
│   │   │   │   │   └── TaxReceipt.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── DonorTier.ts     # BRONZE | SILVER | GOLD | PATRON
│   │   │   │   │   └── TaxYear.ts
│   │   │   │   └── ports/
│   │   │   │       ├── inbound/
│   │   │   │       │   ├── GetDonorProfile.ts
│   │   │   │       │   └── IssueTaxReceipt.ts
│   │   │   │       └── outbound/
│   │   │   │           └── DonorRepository.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetDonorProfileUseCase.ts
│   │   │   │       └── IssueTaxReceiptUseCase.ts
│   │   │   └── infrastructure/
│   │   │       └── adapters/ ...
│   │   │
│   │   ├── beneficiary/                 # ── Extended: Phase 5 ──
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Beneficiary.ts
│   │   │   │   │   └── Program.ts
│   │   │   │   └── ports/ ...
│   │   │   ├── application/ ...
│   │   │   └── infrastructure/ ...
│   │   │
│   │   └── event/                       # ── Extended: Phase 6 ──
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   ├── Event.ts
│   │       │   │   └── EventRegistration.ts
│   │       │   └── ports/ ...
│   │       ├── application/ ...
│   │       └── infrastructure/ ...
│   │
│   └── main.ts                          # Entry point: compose & start
│
├── test/
│   ├── unit/                            # Domain & use-case tests (no infra)
│   │   ├── donation/
│   │   ├── volunteer/
│   │   └── iam/
│   ├── integration/                     # Adapter tests with testcontainers
│   │   ├── repositories/
│   │   └── external/
│   └── e2e/                             # Full HTTP request tests
│       └── api/
│
├── docs/
│   ├── openapi.yaml                     # Merged OpenAPI spec
│   └── adr/                             # Architecture Decision Records
│       ├── 001-hexagonal-architecture.md
│       ├── 002-fastify-over-express.md
│       └── 003-stripe-integration.md
│
├── scripts/
│   ├── migrate.ts                       # DB migration runner
│   └── seed.ts                          # Dev seed data
│
├── render.yaml                          # Render IaC blueprint
├── Dockerfile
├── docker-compose.yml                   # Local dev (PG + Redis)
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 2. Shared Kernel & Foundational Types

### 2.1 Base Entity

```typescript
// src/shared/domain/Entity.ts
import { UniqueId } from "./value-objects/UniqueId";

export abstract class Entity<TProps> {
  protected readonly _id: UniqueId;
  protected props: TProps;

  constructor(id: UniqueId, props: TProps) {
    this._id = id;
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }

  equals(other?: Entity<TProps>): boolean {
    if (!other) return false;
    return this._id.equals(other._id);
  }
}
```

### 2.2 Aggregate Root

```typescript
// src/shared/domain/AggregateRoot.ts
import { Entity } from "./Entity";
import { DomainEvent } from "./events/DomainEvent";

export abstract class AggregateRoot<TProps> extends Entity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
```

### 2.3 Domain Event

```typescript
// src/shared/domain/events/DomainEvent.ts
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}

// src/shared/domain/events/EventBus.ts
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): void;
}
```

### 2.4 Value Objects

```typescript
// src/shared/domain/value-objects/Money.ts
export class Money {
  private constructor(
    readonly amount: number, // stored as integer cents
    readonly currency: string, // ISO 4217
  ) {
    if (amount < 0) throw new ValidationError("Amount cannot be negative");
  }

  static fromCents(cents: number, currency: string): Money {
    return new Money(cents, currency.toUpperCase());
  }

  static fromDollars(dollars: number, currency: string): Money {
    return new Money(Math.round(dollars * 100), currency.toUpperCase());
  }

  add(other: Money): Money {
    if (this.currency !== other.currency)
      throw new ValidationError("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }

  toDisplayString(): string {
    return `${(this.amount / 100).toFixed(2)} ${this.currency}`;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

// src/shared/domain/value-objects/Email.ts
export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new ValidationError(`Invalid email: ${raw}`);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

### 2.5 Generic Use Case & Pagination

```typescript
// src/shared/application/UseCase.ts
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

// src/shared/application/PaginatedQuery.ts
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### 2.6 Transaction Manager Port

```typescript
// src/shared/application/TransactionManager.ts
export interface TransactionManager {
  run<T>(work: (client: TransactionClient) => Promise<T>): Promise<T>;
}

export interface TransactionClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}
```

---

## 3. Phase 1: Core Operations

### 3.1 Donation Domain

```typescript
// ─── Entities ───────────────────────────────────────────────

// src/modules/donation/domain/entities/Donation.ts
interface DonationProps {
  donorId: UniqueId | null;          // null for anonymous
  donorEmail: Email;
  amount: Money;
  campaignId: UniqueId | null;       // optional campaign link
  frequency: DonationFrequency;
  status: DonationStatus;
  paymentIntentId: string | null;    // external gateway reference
  idempotencyKey: string;
  metadata: Record<string, string>;
  createdAt: Date;
  completedAt: Date | null;
}

export class Donation extends AggregateRoot<DonationProps> {
  // Factory method — the only way to create a Donation
  static createIntent(params: {
    donorEmail: Email;
    amount: Money;
    frequency: DonationFrequency;
    campaignId?: UniqueId;
    idempotencyKey: string;
  }): Donation;

  confirm(paymentIntentId: string): void;
  fail(reason: string): void;
  refund(): void;

  get isPending(): boolean;
  get isRecurring(): boolean;
}

// src/modules/donation/domain/entities/RecurringPlan.ts
interface RecurringPlanProps {
  donorId: UniqueId;
  amount: Money;
  frequency: DonationFrequency;         // MONTHLY | QUARTERLY | YEARLY
  campaignId: UniqueId | null;
  nextChargeDate: Date;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  gatewaySubscriptionId: string;
  createdAt: Date;
}

export class RecurringPlan extends AggregateRoot<RecurringPlanProps> {
  static activate(params: { ... }): RecurringPlan;
  pause(): void;
  cancel(): void;
  recordCharge(donationId: UniqueId): void;
}

// ─── Value Objects ──────────────────────────────────────────

// src/modules/donation/domain/value-objects/DonationStatus.ts
export type DonationStatus =
  | "INTENT_CREATED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

// src/modules/donation/domain/value-objects/DonationFrequency.ts
export type DonationFrequency = "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY";

// src/modules/donation/domain/value-objects/PaymentMethod.ts
export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY" | "PAYPAL";

// ─── Inbound Ports (Use Case Interfaces) ────────────────────

// src/modules/donation/domain/ports/inbound/CreateDonationIntent.ts
export interface CreateDonationIntentInput {
  donorEmail: string;
  amountCents: number;
  currency: string;
  frequency: DonationFrequency;
  campaignId?: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface CreateDonationIntentOutput {
  donationId: string;
  clientSecret: string;       // Stripe client secret for frontend
  status: DonationStatus;
}

export interface CreateDonationIntent
  extends UseCase<CreateDonationIntentInput, CreateDonationIntentOutput> {}

// src/modules/donation/domain/ports/inbound/GetDonationHistory.ts
export interface GetDonationHistoryInput {
  donorId: string;
  pagination: PaginationParams;
  filters?: {
    status?: DonationStatus;
    campaignId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface GetDonationHistory
  extends UseCase<GetDonationHistoryInput, PaginatedResult<DonationResponseDto>> {}

// ─── Outbound Ports (Infrastructure Interfaces) ─────────────

// src/modules/donation/domain/ports/outbound/DonationRepository.ts
export interface DonationRepository {
  save(donation: Donation): Promise<void>;
  findById(id: UniqueId): Promise<Donation | null>;
  findByIdempotencyKey(key: string): Promise<Donation | null>;
  findByDonor(donorId: UniqueId, pagination: PaginationParams): Promise<PaginatedResult<Donation>>;
  sumByCampaign(campaignId: UniqueId): Promise<Money>;
}

// src/modules/donation/domain/ports/outbound/PaymentGateway.ts
export interface PaymentGateway {
  createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    metadata: Record<string, string>;
    idempotencyKey: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }>;

  confirmPayment(paymentIntentId: string): Promise<{ status: string }>;
  refundPayment(paymentIntentId: string, amountCents?: number): Promise<void>;

  createSubscription(params: {
    customerEmail: string;
    amountCents: number;
    currency: string;
    interval: "month" | "quarter" | "year";
  }): Promise<{ subscriptionId: string; clientSecret: string }>;

  cancelSubscription(subscriptionId: string): Promise<void>;
}

// src/modules/donation/domain/ports/outbound/ReceiptGenerator.ts
export interface ReceiptGenerator {
  generate(donation: Donation): Promise<Buffer>;    // Returns PDF buffer
}
```

### 3.2 Volunteer Domain

```typescript
// ─── Entities ───────────────────────────────────────────────

// src/modules/volunteer/domain/entities/Volunteer.ts
interface VolunteerProps {
  userId: UniqueId;
  firstName: string;
  lastName: string;
  email: Email;
  phone: PhoneNumber | null;
  skills: Skill[];
  availability: Availability;
  status: VolunteerStatus;
  notes: string;
  backgroundCheckStatus: "PENDING" | "CLEARED" | "FLAGGED" | "NOT_REQUIRED";
  totalHoursLogged: number;
  joinedAt: Date;
}

export class Volunteer extends AggregateRoot<VolunteerProps> {
  static register(params: { ... }): Volunteer;
  updateAvailability(availability: Availability): void;
  addSkill(skill: Skill): void;
  removeSkill(skillName: string): void;
  activate(): void;
  deactivate(): void;
  logHours(hours: number): void;
}

// src/modules/volunteer/domain/entities/VolunteerAssignment.ts
interface AssignmentProps {
  volunteerId: UniqueId;
  campaignId: UniqueId;
  role: string;
  startDate: Date;
  endDate: Date | null;
  hoursCommitted: number;
  status: "ASSIGNED" | "ACTIVE" | "COMPLETED" | "WITHDRAWN";
}

export class VolunteerAssignment extends Entity<AssignmentProps> {
  static create(params: { ... }): VolunteerAssignment;
  complete(hoursLogged: number): void;
  withdraw(reason: string): void;
}

// ─── Value Objects ──────────────────────────────────────────

// src/modules/volunteer/domain/value-objects/Skill.ts
export class Skill {
  constructor(
    readonly name: string,           // e.g. "First Aid", "Teaching", "Web Dev"
    readonly proficiency: "BEGINNER" | "INTERMEDIATE" | "EXPERT"
  ) {}
}

// src/modules/volunteer/domain/value-objects/Availability.ts
export class Availability {
  constructor(
    readonly days: DayOfWeek[],      // ["MONDAY", "WEDNESDAY", "SATURDAY"]
    readonly hoursPerWeek: number,
    readonly timezone: string,        // IANA timezone
    readonly preferRemote: boolean
  ) {}
}

export type VolunteerStatus = "PENDING_REVIEW" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

// ─── Inbound Ports ──────────────────────────────────────────

// src/modules/volunteer/domain/ports/inbound/RegisterVolunteer.ts
export interface RegisterVolunteerInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: Array<{ name: string; proficiency: string }>;
  availability: {
    days: string[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  };
}

export interface RegisterVolunteer
  extends UseCase<RegisterVolunteerInput, { volunteerId: string }> {}

// src/modules/volunteer/domain/ports/inbound/SearchVolunteers.ts
export interface SearchVolunteersInput {
  pagination: PaginationParams;
  filters?: {
    skills?: string[];
    availability?: string[];
    status?: VolunteerStatus;
    minHoursPerWeek?: number;
  };
}

export interface SearchVolunteers
  extends UseCase<SearchVolunteersInput, PaginatedResult<VolunteerResponseDto>> {}

// ─── Outbound Ports ─────────────────────────────────────────

// src/modules/volunteer/domain/ports/outbound/VolunteerRepository.ts
export interface VolunteerRepository {
  save(volunteer: Volunteer): Promise<void>;
  findById(id: UniqueId): Promise<Volunteer | null>;
  findByUserId(userId: UniqueId): Promise<Volunteer | null>;
  search(filters: SearchVolunteersInput): Promise<PaginatedResult<Volunteer>>;
  countActive(): Promise<number>;
}
```

### 3.3 Phase 1 — OpenAPI Contracts

```yaml
# POST /api/v1/donations/intent
paths:
  /api/v1/donations/intent:
    post:
      operationId: createDonationIntent
      tags: [Donations]
      summary: Create a donation intent for client-side payment confirmation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                [
                  donorEmail,
                  amountCents,
                  currency,
                  frequency,
                  paymentMethod,
                  idempotencyKey,
                ]
              properties:
                donorEmail:
                  type: string
                  format: email
                amountCents:
                  type: integer
                  minimum: 100 # $1 minimum
                  maximum: 100000000 # $1M cap
                currency:
                  type: string
                  enum: [USD, EUR, GBP, CAD, XAF]
                frequency:
                  type: string
                  enum: [ONE_TIME, MONTHLY, QUARTERLY, YEARLY]
                campaignId:
                  type: string
                  format: uuid
                paymentMethod:
                  type: string
                  enum: [CARD, BANK_TRANSFER, MOBILE_MONEY, PAYPAL]
                idempotencyKey:
                  type: string
                  minLength: 16
                  maxLength: 64
      responses:
        "201":
          description: Intent created
          content:
            application/json:
              schema:
                type: object
                properties:
                  donationId:
                    type: string
                    format: uuid
                  clientSecret:
                    type: string
                  status:
                    type: string
                    enum: [INTENT_CREATED]
        "409":
          description: Duplicate idempotency key (returns existing intent)
        "422":
          description: Validation error

  /api/v1/donations/{donationId}:
    get:
      operationId: getDonation
      tags: [Donations]
      security: [{ bearerAuth: [] }]
      parameters:
        - name: donationId
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: Donation details
        "404":
          description: Donation not found

  /api/v1/donations:
    get:
      operationId: getDonationHistory
      tags: [Donations]
      security: [{ bearerAuth: [] }]
      parameters:
        - { name: page, in: query, schema: { type: integer, default: 1 } }
        - {
            name: limit,
            in: query,
            schema: { type: integer, default: 20, maximum: 100 },
          }
        - { name: status, in: query, schema: { type: string } }
        - {
            name: campaignId,
            in: query,
            schema: { type: string, format: uuid },
          }
        - { name: dateFrom, in: query, schema: { type: string, format: date } }
        - { name: dateTo, in: query, schema: { type: string, format: date } }
      responses:
        "200":
          description: Paginated donation history

  /api/v1/volunteers:
    post:
      operationId: registerVolunteer
      tags: [Volunteers]
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firstName, lastName, email, skills, availability]
              properties:
                firstName: { type: string, minLength: 1, maxLength: 100 }
                lastName: { type: string, minLength: 1, maxLength: 100 }
                email: { type: string, format: email }
                phone: { type: string }
                skills:
                  type: array
                  items:
                    type: object
                    properties:
                      name: { type: string }
                      proficiency:
                        { type: string, enum: [BEGINNER, INTERMEDIATE, EXPERT] }
                availability:
                  type: object
                  properties:
                    days:
                      type: array
                      items:
                        {
                          type: string,
                          enum: [MON, TUE, WED, THU, FRI, SAT, SUN],
                        }
                    hoursPerWeek: { type: integer, minimum: 1, maximum: 80 }
                    timezone: { type: string }
                    preferRemote: { type: boolean }
      responses:
        "201":
          description: Volunteer registered
        "409":
          description: Already registered

    get:
      operationId: searchVolunteers
      tags: [Volunteers]
      security: [{ bearerAuth: [] }]
      parameters:
        - { name: page, in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 20 } }
        - {
            name: skills,
            in: query,
            schema: { type: array, items: { type: string } },
          }
        - { name: status, in: query, schema: { type: string } }
      responses:
        "200":
          description: Paginated volunteer list
```

---

## 4. Phase 2: Identity & Access Management

### 4.1 IAM Domain

```typescript
// ─── Entities ───────────────────────────────────────────────

// src/modules/iam/domain/entities/User.ts
interface UserProps {
  email: Email;
  hashedPassword: HashedPassword;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  static register(params: {
    email: Email;
    hashedPassword: HashedPassword;
    firstName: string;
    lastName: string;
  }): User;

  login(plainPassword: string, hasher: PasswordHasher): boolean;
  assignRole(role: Role): void;
  removeRole(roleName: RoleName): void;
  hasPermission(permission: Permission): boolean;
  lock(durationMinutes: number): void;
  verifyEmail(): void;
  deactivate(): void;
}

// src/modules/iam/domain/entities/Role.ts
interface RoleProps {
  name: RoleName;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // system roles (ADMIN, STAFF) can't be deleted
}

export class Role extends Entity<RoleProps> {
  static create(name: RoleName, permissions: Permission[]): Role;
  addPermission(perm: Permission): void;
  removePermission(perm: Permission): void;
}

// src/modules/iam/domain/entities/AuditLogEntry.ts
interface AuditLogProps {
  userId: UniqueId;
  action: string; // "USER_LOGIN" | "ROLE_ASSIGNED" | "DONATION_REFUNDED" ...
  resource: string; // "user:uuid" | "donation:uuid"
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export class AuditLogEntry extends Entity<AuditLogProps> {
  static record(params: Omit<AuditLogProps, "timestamp">): AuditLogEntry;
}

// ─── Value Objects ──────────────────────────────────────────

// src/modules/iam/domain/value-objects/Permission.ts
export type Permission =
  | "donations:read"
  | "donations:write"
  | "donations:refund"
  | "volunteers:read"
  | "volunteers:write"
  | "volunteers:assign"
  | "campaigns:read"
  | "campaigns:write"
  | "campaigns:publish"
  | "reports:read"
  | "reports:generate"
  | "users:read"
  | "users:write"
  | "users:manage-roles"
  | "audit:read"
  | "settings:manage"
  | "beneficiaries:read"
  | "beneficiaries:write"
  | "events:read"
  | "events:write";

// src/modules/iam/domain/value-objects/RoleName.ts
export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "VOLUNTEER"
  | "DONOR"
  | "PUBLIC";

// ─── Inbound Ports ──────────────────────────────────────────

// src/modules/iam/domain/ports/inbound/LoginUser.ts
export interface LoginUserInput {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginUserOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface LoginUser extends UseCase<LoginUserInput, LoginUserOutput> {}

// src/modules/iam/domain/ports/inbound/GetAuditLogs.ts
export interface GetAuditLogsInput {
  pagination: PaginationParams;
  filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface GetAuditLogs extends UseCase<
  GetAuditLogsInput,
  PaginatedResult<AuditLogEntry>
> {}

// ─── Outbound Ports ─────────────────────────────────────────

// src/modules/iam/domain/ports/outbound/TokenService.ts
export interface TokenService {
  generateAccessToken(payload: {
    userId: string;
    roles: string[];
    permissions: string[];
  }): string;

  generateRefreshToken(userId: string): string;

  verifyAccessToken(token: string): {
    userId: string;
    roles: string[];
    permissions: string[];
  };

  verifyRefreshToken(token: string): { userId: string };
  revokeRefreshToken(token: string): Promise<void>;
}

// src/modules/iam/domain/ports/outbound/PasswordHasher.ts
export interface PasswordHasher {
  hash(plainPassword: string): Promise<HashedPassword>;
  verify(plainPassword: string, hashed: HashedPassword): Promise<boolean>;
}
```

### 4.2 RBAC — Default Role → Permission Matrix

```
┌──────────────┬─────────────────────────────────────────────────────────┐
│ Role         │ Permissions                                            │
├──────────────┼─────────────────────────────────────────────────────────┤
│ SUPER_ADMIN  │ * (all permissions)                                    │
│ ADMIN        │ all except settings:manage                             │
│ STAFF        │ donations:read/write, volunteers:read/write/assign,    │
│              │ campaigns:read/write, reports:read/generate,           │
│              │ beneficiaries:read/write, events:read/write            │
│ VOLUNTEER    │ volunteers:read (own), campaigns:read, events:read     │
│ DONOR        │ donations:read (own), campaigns:read                   │
│ PUBLIC       │ campaigns:read (published only)                        │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 4.3 Phase 2 — OpenAPI Contracts

```yaml
paths:
  /api/v1/auth/register:
    post:
      operationId: registerUser
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, firstName, lastName]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 12, maxLength: 128 }
                firstName: { type: string, minLength: 1 }
                lastName: { type: string, minLength: 1 }
      responses:
        "201": { description: User registered, email verification sent }
        "409": { description: Email already in use }

  /api/v1/auth/login:
    post:
      operationId: loginUser
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string }
      responses:
        "200":
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  refreshToken: { type: string }
                  expiresIn: { type: integer }
                  user:
                    type: object
                    properties:
                      id: { type: string, format: uuid }
                      email: { type: string }
                      firstName: { type: string }
                      lastName: { type: string }
                      roles: { type: array, items: { type: string } }
        "401": { description: Invalid credentials }
        "423": { description: Account locked }

  /api/v1/auth/refresh:
    post:
      operationId: refreshToken
      tags: [Auth]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken: { type: string }
      responses:
        "200": { description: New token pair }
        "401": { description: Invalid or expired refresh token }

  /api/v1/admin/audit-logs:
    get:
      operationId: getAuditLogs
      tags: [Admin]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [audit:read]
      parameters:
        - { name: page, in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 50 } }
        - { name: userId, in: query, schema: { type: string, format: uuid } }
        - { name: action, in: query, schema: { type: string } }
        - {
            name: dateFrom,
            in: query,
            schema: { type: string, format: date-time },
          }
        - {
            name: dateTo,
            in: query,
            schema: { type: string, format: date-time },
          }
      responses:
        "200": { description: Paginated audit log entries }
        "403": { description: Insufficient permissions }

  /api/v1/admin/users/{userId}/roles:
    put:
      operationId: assignRole
      tags: [Admin]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [users:manage-roles]
      parameters:
        - {
            name: userId,
            in: path,
            required: true,
            schema: { type: string, format: uuid },
          }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [roleName]
              properties:
                roleName:
                  { type: string, enum: [ADMIN, STAFF, VOLUNTEER, DONOR] }
      responses:
        "200": { description: Role assigned }
        "403": { description: Cannot assign SUPER_ADMIN }
```

---

## 5. Phase 3: Content & Campaign Management

### 5.1 Campaign Domain

```typescript
// ─── Entities ───────────────────────────────────────────────

// src/modules/campaign/domain/entities/Campaign.ts
interface CampaignProps {
  title: string;
  slug: Slug;
  description: string;
  coverImageUrl: string | null;
  fundingGoal: FundingGoal;
  amountRaised: Money;
  donationCount: number;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date | null;
  createdBy: UniqueId;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign extends AggregateRoot<CampaignProps> {
  static create(params: { ... }): Campaign;

  publish(): void;                          // DRAFT → ACTIVE
  pause(): void;                            // ACTIVE → PAUSED
  close(): void;                            // ACTIVE → CLOSED
  recordDonation(amount: Money): void;      // Increments totals, checks goal
  updateDetails(params: Partial<{
    title: string;
    description: string;
    endDate: Date;
  }>): void;

  get progressPercentage(): number;
  get isGoalReached(): boolean;
  get isExpired(): boolean;
}

// src/modules/campaign/domain/entities/ImpactMetric.ts
interface ImpactMetricProps {
  campaignId: UniqueId;
  type: MetricType;
  label: string;                  // "Meals Served", "Trees Planted"
  value: number;
  unit: string;                   // "meals", "trees", "students"
  recordedAt: Date;
  recordedBy: UniqueId;
}

export class ImpactMetric extends Entity<ImpactMetricProps> {
  static record(params: { ... }): ImpactMetric;
}

// src/modules/campaign/domain/entities/CampaignUpdate.ts
interface CampaignUpdateProps {
  campaignId: UniqueId;
  authorId: UniqueId;
  title: string;
  body: string;                   // Markdown content
  imageUrls: string[];
  createdAt: Date;
}

export class CampaignUpdate extends Entity<CampaignUpdateProps> {
  static create(params: { ... }): CampaignUpdate;
}

// ─── Value Objects ──────────────────────────────────────────

export class FundingGoal {
  constructor(
    readonly target: Money,
    readonly isFlexible: boolean     // flexible = no hard cap
  ) {}
}

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "ARCHIVED";

export type MetricType =
  | "PEOPLE_SERVED"
  | "ITEMS_DISTRIBUTED"
  | "AREA_RESTORED"
  | "FUNDS_DISBURSED"
  | "CUSTOM";

// ─── Outbound Ports ─────────────────────────────────────────

// src/modules/campaign/domain/ports/outbound/CampaignRepository.ts
export interface CampaignRepository {
  save(campaign: Campaign): Promise<void>;
  findById(id: UniqueId): Promise<Campaign | null>;
  findBySlug(slug: Slug): Promise<Campaign | null>;
  findPublished(pagination: PaginationParams): Promise<PaginatedResult<Campaign>>;
  findByCreator(userId: UniqueId): Promise<Campaign[]>;
}

// src/modules/campaign/domain/ports/outbound/MetricRepository.ts
export interface MetricRepository {
  save(metric: ImpactMetric): Promise<void>;
  findByCampaign(campaignId: UniqueId): Promise<ImpactMetric[]>;
  aggregate(params: {
    campaignIds?: string[];
    types?: MetricType[];
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<MetricAggregateDto[]>;
  globalSummary(): Promise<{
    totalPeopleServed: number;
    totalFundsRaised: Money;
    totalVolunteerHours: number;
    activeCampaigns: number;
  }>;
}

// src/modules/campaign/domain/ports/outbound/MediaStorage.ts
export interface MediaStorage {
  upload(file: Buffer, filename: string, contentType: string): Promise<string>;  // returns URL
  delete(url: string): Promise<void>;
  generateSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
```

### 5.2 Phase 3 — OpenAPI Contracts

```yaml
paths:
  /api/v1/campaigns:
    post:
      operationId: createCampaign
      tags: [Campaigns]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [campaigns:write]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                [title, description, fundingGoalCents, currency, startDate]
              properties:
                title: { type: string, minLength: 5, maxLength: 200 }
                description: { type: string, minLength: 20 }
                fundingGoalCents: { type: integer, minimum: 1000 }
                currency: { type: string, enum: [USD, EUR, GBP, CAD, XAF] }
                isFlexibleGoal: { type: boolean, default: false }
                startDate: { type: string, format: date }
                endDate: { type: string, format: date }
                tags: { type: array, items: { type: string }, maxItems: 10 }
      responses:
        "201": { description: Campaign created in DRAFT status }

    get:
      operationId: listPublicCampaigns
      tags: [Campaigns]
      description: Public endpoint — no auth required
      parameters:
        - { name: page, in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 12 } }
        - { name: tag, in: query, schema: { type: string } }
        - {
            name: status,
            in: query,
            schema: { type: string, enum: [ACTIVE, CLOSED] },
          }
        - {
            name: sort,
            in: query,
            schema: { type: string, enum: [newest, most_funded, ending_soon] },
          }
      responses:
        "200": { description: Paginated campaigns }

  /api/v1/campaigns/{campaignId}/publish:
    post:
      operationId: publishCampaign
      tags: [Campaigns]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [campaigns:publish]
      responses:
        "200": { description: Campaign published }

  /api/v1/campaigns/{campaignId}/metrics:
    post:
      operationId: recordMetric
      tags: [Impact Metrics]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [campaigns:write]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [type, label, value, unit]
              properties:
                type:
                  {
                    type: string,
                    enum:
                      [
                        PEOPLE_SERVED,
                        ITEMS_DISTRIBUTED,
                        AREA_RESTORED,
                        FUNDS_DISBURSED,
                        CUSTOM,
                      ],
                  }
                label: { type: string }
                value: { type: number, minimum: 0 }
                unit: { type: string }
      responses:
        "201": { description: Metric recorded }

  /api/v1/metrics/aggregate:
    get:
      operationId: getAggregateMetrics
      tags: [Impact Metrics]
      description: Public endpoint — cached aggressively (Redis, 5min TTL)
      parameters:
        - {
            name: campaignIds,
            in: query,
            schema: { type: array, items: { type: string } },
          }
        - {
            name: types,
            in: query,
            schema: { type: array, items: { type: string } },
          }
      responses:
        "200":
          description: Aggregated impact metrics
          headers:
            Cache-Control:
              { schema: { type: string, example: "public, max-age=300" } }
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalPeopleServed: { type: integer }
                  totalFundsRaisedCents: { type: integer }
                  totalVolunteerHours: { type: integer }
                  activeCampaigns: { type: integer }
                  byCampaign:
                    type: array
                    items:
                      type: object
                      properties:
                        campaignId: { type: string }
                        campaignTitle: { type: string }
                        metrics:
                          type: array
                          items:
                            type: object
                            properties:
                              type: { type: string }
                              label: { type: string }
                              totalValue: { type: number }
                              unit: { type: string }
```

---

## 6. Phase 4: Communications & Reporting

### 6.1 Notification Domain

```typescript
// src/modules/notification/domain/entities/Notification.ts
interface NotificationProps {
  recipientId: UniqueId;
  recipientEmail: Email;
  channel: NotificationChannel;
  templateId: TemplateId;
  subject: string;
  body: string;                      // Pre-rendered content
  variables: Record<string, string>; // Template variables
  status: NotificationStatus;
  sentAt: Date | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: Date;
}

export class Notification extends Entity<NotificationProps> {
  static create(params: { ... }): Notification;
  markSent(): void;
  markFailed(reason: string): void;
  canRetry(): boolean;               // max 3 retries
}

// Value Objects
export type NotificationChannel = "EMAIL" | "SMS" | "IN_APP";
export type NotificationStatus = "QUEUED" | "SENT" | "FAILED" | "BOUNCED";

export class TemplateId {
  static DONATION_RECEIPT = new TemplateId("donation_receipt");
  static DONATION_RECURRING_STARTED = new TemplateId("recurring_started");
  static VOLUNTEER_WELCOME = new TemplateId("volunteer_welcome");
  static VOLUNTEER_ASSIGNMENT = new TemplateId("volunteer_assignment");
  static CAMPAIGN_UPDATE = new TemplateId("campaign_update");
  static CAMPAIGN_GOAL_REACHED = new TemplateId("campaign_goal_reached");
  static PASSWORD_RESET = new TemplateId("password_reset");
  static EMAIL_VERIFICATION = new TemplateId("email_verification");

  constructor(readonly value: string) {}
}

// ─── Outbound Ports ─────────────────────────────────────────

// src/modules/notification/domain/ports/outbound/EmailSender.ts
export interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
}

// src/modules/notification/domain/ports/outbound/SmsSender.ts
export interface SmsSender {
  send(params: {
    to: string;
    body: string;
  }): Promise<{ messageId: string }>;
}
```

### 6.2 Webhook Processing (Idempotent)

```typescript
// src/modules/notification/domain/ports/inbound/ProcessWebhook.ts
export interface ProcessWebhookInput {
  provider: "stripe" | "paypal";
  eventType: string;
  payload: Record<string, unknown>;
  signature: string; // Webhook signature for verification
  idempotencyKey: string; // Provider's event ID
  receivedAt: Date;
}

export interface ProcessWebhook extends UseCase<
  ProcessWebhookInput,
  { processed: boolean; action: string }
> {}

// Idempotency is enforced via a processed_webhooks table:
// - Before processing: check if idempotencyKey exists
// - After processing: insert idempotencyKey + result
// - Duplicate deliveries return cached result
```

### 6.3 Report Domain

```typescript
// src/modules/report/domain/entities/Report.ts
interface ReportProps {
  type: ReportType;
  format: ReportFormat;
  title: string;
  parameters: Record<string, unknown>;  // Date range, campaign filter, etc.
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
  fileUrl: string | null;
  generatedBy: UniqueId;
  generatedAt: Date | null;
  expiresAt: Date;                      // Auto-cleanup signed URL
  createdAt: Date;
}

export class Report extends AggregateRoot<ReportProps> {
  static request(params: { ... }): Report;
  markGenerating(): void;
  complete(fileUrl: string): void;
  fail(reason: string): void;
}

export type ReportType = "FINANCIAL_SUMMARY" | "DONATION_DETAIL" | "IMPACT_SUMMARY" | "VOLUNTEER_HOURS" | "DONOR_RETENTION" | "TAX_REPORT";
export type ReportFormat = "PDF" | "CSV" | "XLSX";
```

### 6.4 Phase 4 — OpenAPI Contracts

```yaml
paths:
  /api/v1/webhooks/payment:
    post:
      operationId: handlePaymentWebhook
      tags: [Webhooks]
      description: |
        Receives payment events from Stripe/PayPal.
        Verifies webhook signature before processing.
        Idempotent — safe to receive duplicate events.
      security: [] # No JWT — uses webhook signature
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object # Raw provider payload
      parameters:
        - name: Stripe-Signature
          in: header
          schema: { type: string }
      responses:
        "200":
          description: Webhook processed
          content:
            application/json:
              schema:
                type: object
                properties:
                  processed: { type: boolean }
                  action: { type: string }
        "400": { description: Invalid signature }
        "409": { description: Already processed (idempotent success) }

  /api/v1/reports:
    post:
      operationId: generateReport
      tags: [Reports]
      security: [{ bearerAuth: [] }]
      x-required-permissions: [reports:generate]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [type, format]
              properties:
                type:
                  type: string
                  enum:
                    [
                      FINANCIAL_SUMMARY,
                      DONATION_DETAIL,
                      IMPACT_SUMMARY,
                      VOLUNTEER_HOURS,
                      DONOR_RETENTION,
                      TAX_REPORT,
                    ]
                format:
                  type: string
                  enum: [PDF, CSV, XLSX]
                dateFrom: { type: string, format: date }
                dateTo: { type: string, format: date }
                campaignIds:
                  type: array
                  items: { type: string, format: uuid }
      responses:
        "202":
          description: Report generation queued (async)
          content:
            application/json:
              schema:
                type: object
                properties:
                  reportId: { type: string, format: uuid }
                  status: { type: string, enum: [PENDING] }
                  estimatedSeconds: { type: integer }

  /api/v1/reports/{reportId}:
    get:
      operationId: getReportStatus
      tags: [Reports]
      security: [{ bearerAuth: [] }]
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  reportId: { type: string }
                  status: { type: string }
                  downloadUrl: { type: string, nullable: true }
                  expiresAt: { type: string, format: date-time, nullable: true }
```

---

## 7. Phase 5: Donor & Beneficiary Management (Extended)

These modules go beyond the original prompt but are essential for a real NGO platform.

### 7.1 Donor Profile Domain

```typescript
// src/modules/donor/domain/entities/DonorProfile.ts
interface DonorProfileProps {
  userId: UniqueId;
  tier: DonorTier;
  totalDonatedAllTime: Money;
  donationCount: number;
  firstDonationAt: Date;
  lastDonationAt: Date;
  isAnonymousPreferred: boolean;
  communicationPreferences: {
    receiveNewsletter: boolean;
    receiveUpdates: boolean;
    preferredChannel: NotificationChannel;
  };
}

export class DonorProfile extends AggregateRoot<DonorProfileProps> {
  recalculateTier(): void; // Tier auto-calculated from totalDonated thresholds
}

export type DonorTier = "BRONZE" | "SILVER" | "GOLD" | "PATRON";
// Thresholds: BRONZE <$500, SILVER <$2000, GOLD <$10000, PATRON >= $10000

// src/modules/donor/domain/entities/TaxReceipt.ts
interface TaxReceiptProps {
  donorId: UniqueId;
  taxYear: number;
  totalDeductibleCents: number;
  currency: string;
  donations: Array<{ donationId: string; date: Date; amountCents: number }>;
  fileUrl: string | null;
  generatedAt: Date;
}
```

### 7.2 Beneficiary Domain

```typescript
// src/modules/beneficiary/domain/entities/Beneficiary.ts
interface BeneficiaryProps {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  location: string;
  programIds: UniqueId[];
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  enrolledAt: Date;
  notes: string; // Internal staff notes only
}

// src/modules/beneficiary/domain/entities/Program.ts
interface ProgramProps {
  name: string;
  description: string;
  campaignId: UniqueId | null; // Optional link to funding campaign
  capacity: number;
  enrolledCount: number;
  status: "ACTIVE" | "COMPLETED" | "PLANNED";
}
```

---

## 8. Phase 6: Event Management (Extended)

```typescript
// src/modules/event/domain/entities/Event.ts
interface EventProps {
  title: string;
  slug: Slug;
  description: string;
  type: "FUNDRAISER" | "VOLUNTEER_DRIVE" | "AWARENESS" | "COMMUNITY";
  campaignId: UniqueId | null;
  location: {
    venue: string;
    address: string;
    coordinates: { lat: number; lng: number } | null;
    isVirtual: boolean;
    virtualLink: string | null;
  };
  startDate: Date;
  endDate: Date;
  maxAttendees: number | null;       // null = unlimited
  registrationCount: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  createdBy: UniqueId;
}

export class Event extends AggregateRoot<EventProps> {
  static create(params: { ... }): Event;
  publish(): void;
  cancel(reason: string): void;
  registerAttendee(userId: UniqueId): EventRegistration;
  get isFull(): boolean;
}

// OpenAPI endpoints:
// POST   /api/v1/events
// GET    /api/v1/events           (public, filterable)
// GET    /api/v1/events/:slug
// POST   /api/v1/events/:id/register
// DELETE /api/v1/events/:id/register  (cancel own registration)
```

---

## 9. Security, Performance & Infrastructure

### 9.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Transport:  HTTPS enforced (Render handles TLS termination)        │
│                                                                         │
│  2. Rate Limiting (per IP + per user):                                 │
│     ├── Global:       100 req/min per IP                               │
│     ├── Auth routes:  10 req/min per IP  (brute force protection)      │
│     ├── Webhooks:     50 req/min per source IP                         │
│     └── Public API:   60 req/min per IP                                │
│     Implementation: @fastify/rate-limit backed by Redis                │
│                                                                         │
│  3. Request Validation & Sanitization:                                 │
│     ├── Zod schemas on every route (coerce + strip unknown fields)     │
│     ├── SQL injection: parameterized queries only (pg driver)          │
│     ├── XSS: DOMPurify on any user-generated HTML/Markdown            │
│     └── CORS: explicit allowlist of frontend origins                   │
│                                                                         │
│  4. Authentication:                                                     │
│     ├── Access Token:  JWT, RS256, 15min TTL, in Authorization header  │
│     ├── Refresh Token: opaque UUID, 7-day TTL, stored in Redis         │
│     ├── Token rotation: new refresh token on each refresh              │
│     └── Logout: revoke refresh token from Redis                        │
│                                                                         │
│  5. Authorization (RBAC):                                              │
│     ├── Permissions encoded in JWT claims                              │
│     ├── Route-level guards via Fastify decorators                      │
│     └── Resource-level ownership checks in use cases                   │
│                                                                         │
│  6. Webhook Security:                                                  │
│     ├── Stripe: signature verification via stripe.webhooks.construct   │
│     ├── Replay protection: reject events older than 5 minutes          │
│     └── IP allowlist: optional Stripe webhook IP ranges                │
│                                                                         │
│  7. Secrets Management:                                                │
│     ├── All secrets in Render environment variables                    │
│     ├── JWT private key: RS256 PEM in env var (not file)              │
│     └── DB credentials: Render internal connection string              │
│                                                                         │
│  8. Audit Trail:                                                       │
│     ├── All state-changing operations logged to audit_logs table       │
│     ├── Fields: userId, action, resource, ip, userAgent, timestamp     │
│     └── Immutable append-only — no UPDATE or DELETE on this table      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 JWT Token Structure

```typescript
// Access Token payload (short-lived, stateless)
interface AccessTokenPayload {
  sub: string; // userId
  roles: RoleName[];
  permissions: Permission[];
  iat: number;
  exp: number; // 15 minutes
  iss: "ngo-platform";
}

// Refresh Token: opaque UUID stored in Redis
// Key: `refresh:{token}` → Value: `{ userId, createdAt, deviceId }`
// TTL: 7 days
```

### 9.3 Zod Validation Pattern

```typescript
// src/modules/donation/infrastructure/adapters/http/donation.schema.ts
import { z } from "zod";

export const createDonationIntentSchema = z.object({
  donorEmail: z.string().email().max(255),
  amountCents: z.number().int().min(100).max(100_000_000),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "XAF"]),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"]),
  campaignId: z.string().uuid().optional(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "MOBILE_MONEY", "PAYPAL"]),
  idempotencyKey: z.string().min(16).max(64),
});

export type CreateDonationIntentBody = z.infer<
  typeof createDonationIntentSchema
>;

// Applied in controller:
// const validated = createDonationIntentSchema.parse(request.body);
```

### 9.4 Performance Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PERFORMANCE STRATEGIES                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PostgreSQL Connection Pooling:                                        │
│  ├── Library: pg (node-postgres) with Pool                             │
│  ├── Pool config:                                                      │
│  │   ├── min: 2                                                        │
│  │   ├── max: 10     (Render Starter DB allows 20 connections,         │
│  │   │                 leave headroom for migrations + monitoring)      │
│  │   ├── idleTimeoutMillis: 30000                                      │
│  │   └── connectionTimeoutMillis: 5000                                 │
│  └── Render-specific: use internal DB URL (no public internet hop)     │
│                                                                         │
│  Query Optimization:                                                   │
│  ├── Indexes on: email, donor_id, campaign_id, status, created_at      │
│  ├── Composite indexes: (campaign_id, status), (donor_id, created_at)  │
│  ├── Partial indexes: WHERE status = 'ACTIVE' on campaigns             │
│  ├── EXPLAIN ANALYZE on all queries during development                 │
│  └── Avoid N+1: use JOINs or batch loaders in repositories            │
│                                                                         │
│  Redis Caching (Render Redis):                                         │
│  ├── Public impact metrics:      TTL 5 minutes                         │
│  ├── Campaign listing (public):  TTL 2 minutes                         │
│  ├── User session/refresh:       TTL 7 days                            │
│  ├── Rate limit counters:        TTL 1 minute (sliding window)         │
│  ├── Idempotency keys:           TTL 24 hours                          │
│  └── Cache invalidation:         Event-driven (on DonationCompleted,   │
│                                   MetricRecorded, etc.)                │
│                                                                         │
│  Response Optimization:                                                │
│  ├── Pagination: cursor-based for large datasets, offset for small     │
│  ├── Compression: gzip via Fastify compress plugin                     │
│  ├── ETags: on public campaign/metric endpoints                        │
│  └── Selective fields: ?fields=id,title,amountRaised query param       │
│                                                                         │
│  Background Jobs (BullMQ + Redis):                                     │
│  ├── Report generation (CPU-intensive, runs in worker)                 │
│  ├── Email/SMS sending (async, with retries)                           │
│  ├── Receipt PDF generation                                            │
│  ├── Recurring donation charge scheduling                              │
│  └── Cache warming on deploy                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.5 Resilience Patterns

```typescript
// ─── Idempotency (Payment Webhooks) ─────────────────────────

// Table: processed_webhooks
// Columns: idempotency_key (PK), provider, event_type, result, processed_at
// Flow:
//   1. Receive webhook → extract event ID as idempotency_key
//   2. BEGIN TRANSACTION
//   3. SELECT FROM processed_webhooks WHERE idempotency_key = $1 FOR UPDATE
//   4. If exists → return cached result, COMMIT
//   5. If not → process event → INSERT into processed_webhooks → COMMIT
//   6. Cleanup: delete entries older than 30 days via scheduled job

// ─── Circuit Breaker (External APIs) ────────────────────────

// Wrap all outbound adapters (Stripe, SendGrid, Twilio, S3) with
// a lightweight circuit breaker:
export interface CircuitBreakerConfig {
  failureThreshold: number;     // 5 failures
  resetTimeoutMs: number;       // 30 seconds
  halfOpenMaxAttempts: number;  // 2
}
// States: CLOSED → OPEN (after threshold) → HALF_OPEN (after timeout) → CLOSED
// On OPEN: throw ServiceUnavailableError immediately, don't call external API

// ─── Graceful Error Handling at Adapter Boundaries ──────────

// Every infrastructure adapter wraps external errors into domain errors:
// - Stripe error → PaymentFailedError (domain)
// - SendGrid error → NotificationFailedError (domain)
// - PG connection error → RepositoryError (infrastructure)
// The use case layer NEVER sees infrastructure-specific error types.

// Pattern in adapters:
class StripePaymentGateway implements PaymentGateway {
  async createPaymentIntent(params: { ... }) {
    try {
      const intent = await this.stripe.paymentIntents.create({ ... });
      return { clientSecret: intent.client_secret!, paymentIntentId: intent.id };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeCardError) {
        throw new PaymentFailedError(error.message, error.code);
      }
      throw new ExternalServiceError("Payment gateway unavailable");
    }
  }
}

// ─── Health Checks ──────────────────────────────────────────

// GET /health (used by Render for zero-downtime deploys)
// Returns: { status, postgres, redis, uptime, version }
// Render config: healthCheckPath: /health
```

### 9.6 Cache Port Abstraction

```typescript
// src/shared/infrastructure/cache/CachePort.ts
export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPattern(pattern: string): Promise<void>; // e.g. "campaign:*"
}

// Adapter: RedisCacheAdapter implements CachePort
// Test double: InMemoryCacheAdapter implements CachePort
```

---

## 10. Render Deployment Configuration

### 10.1 render.yaml (Infrastructure as Code)

```yaml
# render.yaml — Render Blueprint
services:
  # ── API Server ─────────────────────────────────────
  - type: web
    name: ngo-api
    runtime: node
    region: frankfurt # or closest to target audience
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: node dist/main.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "10000" # Render's default
      - key: DATABASE_URL
        fromDatabase:
          name: ngo-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: ngo-redis
          type: redis
          property: connectionString
      - key: JWT_PRIVATE_KEY
        sync: false # Set manually in dashboard
      - key: JWT_PUBLIC_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: SENDGRID_API_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
    autoDeploy: true
    scaling:
      minInstances: 1
      maxInstances: 3 # Scale based on traffic
      targetCPUPercent: 70

  # ── Background Worker (same codebase, different entry) ──
  - type: worker
    name: ngo-worker
    runtime: node
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: node dist/worker.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ngo-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: ngo-redis
          type: redis
          property: connectionString
      # ... same secrets as API

  # ── Cron: Recurring Donation Processor ──────────────
  - type: cron
    name: ngo-recurring-charges
    runtime: node
    plan: starter
    schedule: "0 6 * * *" # Daily at 6 AM UTC
    buildCommand: npm ci && npm run build
    startCommand: node dist/crons/process-recurring.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ngo-db
          property: connectionString

databases:
  - name: ngo-db
    plan: starter # 1GB, 20 connections
    region: frankfurt
    postgresMajorVersion: "16"

  # Redis — used for caching, rate limiting, job queues, sessions
  # Note: Render Redis is a separate service
```

### 10.2 Render-Specific Considerations

```
1. Connection Limits:
   - Render Starter PG: 20 connections max
   - Pool max = 10 per instance, so max 2 instances before needing upgrade
   - Worker shares the pool, so budget: API (10) + Worker (5) + Cron (2) + Migrations (1)

2. Zero-Downtime Deploys:
   - Render uses health checks to determine readiness
   - /health must verify DB + Redis connectivity
   - Graceful shutdown: handle SIGTERM, drain connections, finish in-flight requests

3. Static IPs (for webhook allowlisting):
   - Render doesn't provide static IPs on Starter
   - For Stripe webhooks: use signature verification (no IP allowlist needed)
   - If static IP required: use Render's static outbound IPs (paid plans)

4. File Storage:
   - Render's filesystem is ephemeral — never store uploads on disk
   - Use S3-compatible storage (Render Object Storage, Cloudflare R2, or AWS S3)
   - For receipts/reports: generate → upload to S3 → return signed URL

5. Environment Variables:
   - Sensitive values (JWT keys, API keys): set via dashboard, not render.yaml
   - Use sync: false to prevent accidental commits

6. Migrations:
   - Run via a one-off Render Job or as part of the build command:
     buildCommand: npm ci && npm run build && npm run migrate
   - Ensure migrations are idempotent (IF NOT EXISTS patterns)
```

### 10.3 Environment Configuration with Zod

```typescript
// src/shared/infrastructure/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(10000),

  // Database
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),

  // JWT
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().default(900), // 15 min
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().default(604800), // 7 days

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  // SendGrid
  SENDGRID_API_KEY: z.string().startsWith("SG."),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().default("NGO Platform"),

  // Frontend
  FRONTEND_URL: z.string().url(),

  // Media Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(), // For R2/MinIO
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Environment validation failed:", result.error.flatten());
    process.exit(1);
  }
  return result.data;
}
```

---

## 11. Database Schema Overview

```sql
-- Core tables (Phase 1)
CREATE TABLE donations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id        UUID REFERENCES users(id),              -- nullable for anonymous
    donor_email     VARCHAR(255) NOT NULL,
    amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
    currency        VARCHAR(3) NOT NULL,
    frequency       VARCHAR(20) NOT NULL DEFAULT 'ONE_TIME',
    status          VARCHAR(20) NOT NULL DEFAULT 'INTENT_CREATED',
    campaign_id     UUID REFERENCES campaigns(id),
    payment_intent_id VARCHAR(255),
    idempotency_key VARCHAR(64) NOT NULL UNIQUE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donations_donor ON donations(donor_id, created_at DESC);
CREATE INDEX idx_donations_campaign ON donations(campaign_id, status);
CREATE INDEX idx_donations_idempotency ON donations(idempotency_key);

CREATE TABLE recurring_plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id                UUID NOT NULL REFERENCES users(id),
    amount_cents            INTEGER NOT NULL,
    currency                VARCHAR(3) NOT NULL,
    frequency               VARCHAR(20) NOT NULL,
    campaign_id             UUID REFERENCES campaigns(id),
    next_charge_date        DATE NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    gateway_subscription_id VARCHAR(255) NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE volunteers (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id),
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(20),
    skills                  JSONB NOT NULL DEFAULT '[]',
    availability            JSONB NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW',
    background_check_status VARCHAR(20) DEFAULT 'NOT_REQUIRED',
    total_hours_logged      DECIMAL(10,2) DEFAULT 0,
    joined_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE volunteer_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id    UUID NOT NULL REFERENCES volunteers(id),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id),
    role            VARCHAR(100) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    hours_committed DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IAM tables (Phase 2)
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    hashed_password         VARCHAR(255) NOT NULL,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    is_email_verified       BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts   INTEGER DEFAULT 0,
    locked_until            TIMESTAMPTZ,
    last_login_at           TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_system   BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(255) NOT NULL,
    details     JSONB DEFAULT '{}',
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- Campaign tables (Phase 3)
CREATE TABLE campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    cover_image_url TEXT,
    goal_cents      INTEGER NOT NULL,
    goal_currency   VARCHAR(3) NOT NULL,
    is_flexible     BOOLEAN NOT NULL DEFAULT false,
    amount_raised_cents INTEGER NOT NULL DEFAULT 0,
    donation_count  INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    start_date      DATE NOT NULL,
    end_date        DATE,
    created_by      UUID NOT NULL REFERENCES users(id),
    tags            TEXT[] DEFAULT '{}',
    is_published    BOOLEAN NOT NULL DEFAULT false,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE is_published = true;
CREATE INDEX idx_campaigns_slug ON campaigns(slug);

CREATE TABLE impact_metrics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    type        VARCHAR(30) NOT NULL,
    label       VARCHAR(100) NOT NULL,
    value       DECIMAL(15,2) NOT NULL,
    unit        VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE campaign_updates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    author_id   UUID NOT NULL REFERENCES users(id),
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    image_urls  TEXT[] DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification & webhook tables (Phase 4)
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID REFERENCES users(id),
    recipient_email VARCHAR(255) NOT NULL,
    channel         VARCHAR(10) NOT NULL,
    template_id     VARCHAR(50) NOT NULL,
    subject         VARCHAR(255),
    body            TEXT NOT NULL,
    variables       JSONB DEFAULT '{}',
    status          VARCHAR(10) NOT NULL DEFAULT 'QUEUED',
    sent_at         TIMESTAMPTZ,
    failure_reason  TEXT,
    retry_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE processed_webhooks (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    provider        VARCHAR(20) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    result          JSONB NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cleanup: DELETE FROM processed_webhooks WHERE processed_at < NOW() - INTERVAL '30 days'

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(30) NOT NULL,
    format          VARCHAR(10) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    parameters      JSONB NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    file_url        TEXT,
    generated_by    UUID NOT NULL REFERENCES users(id),
    generated_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended tables (Phases 5-6)
CREATE TABLE donor_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id),
    tier            VARCHAR(10) NOT NULL DEFAULT 'BRONZE',
    total_donated_cents BIGINT NOT NULL DEFAULT 0,
    donation_count  INTEGER NOT NULL DEFAULT 0,
    first_donation_at TIMESTAMPTZ,
    last_donation_at  TIMESTAMPTZ,
    is_anonymous    BOOLEAN DEFAULT false,
    comm_prefs      JSONB DEFAULT '{"newsletter":true,"updates":true,"channel":"EMAIL"}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE beneficiaries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    dob         DATE,
    location    VARCHAR(255),
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes       TEXT,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    campaign_id     UUID REFERENCES campaigns(id),
    capacity        INTEGER NOT NULL,
    enrolled_count  INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE beneficiary_programs (
    beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),
    program_id     UUID NOT NULL REFERENCES programs(id),
    enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (beneficiary_id, program_id)
);

CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    type            VARCHAR(20) NOT NULL,
    campaign_id     UUID REFERENCES campaigns(id),
    venue           VARCHAR(200),
    address         TEXT,
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    is_virtual      BOOLEAN DEFAULT false,
    virtual_link    TEXT,
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    max_attendees   INTEGER,
    registration_count INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_registrations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- Seed default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
  ('SUPER_ADMIN', 'Full system access', ARRAY[
    'donations:read','donations:write','donations:refund',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write','campaigns:publish',
    'reports:read','reports:generate',
    'users:read','users:write','users:manage-roles',
    'audit:read','settings:manage',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], true),
  ('ADMIN', 'Administrative access', ARRAY[
    'donations:read','donations:write','donations:refund',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write','campaigns:publish',
    'reports:read','reports:generate',
    'users:read','users:write','users:manage-roles',
    'audit:read',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], true),
  ('STAFF', 'Staff member access', ARRAY[
    'donations:read','donations:write',
    'volunteers:read','volunteers:write','volunteers:assign',
    'campaigns:read','campaigns:write',
    'reports:read','reports:generate',
    'beneficiaries:read','beneficiaries:write',
    'events:read','events:write'
  ], true),
  ('VOLUNTEER', 'Volunteer access', ARRAY[
    'volunteers:read','campaigns:read','events:read'
  ], true),
  ('DONOR', 'Donor access', ARRAY[
    'donations:read','campaigns:read'
  ], true);
```

---

## 12. Testing Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TESTING PYRAMID                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Unit Tests (fast, no I/O, majority of tests):                         │
│  ├── Domain entities: business rule validation                         │
│  │   - Donation.createIntent() enforces minimum amount                 │
│  │   - User.login() locks account after 5 failed attempts              │
│  │   - Campaign.recordDonation() fires GoalReached event               │
│  ├── Value objects: validation + equality                              │
│  │   - Money.add() rejects currency mismatch                           │
│  │   - Email.create() rejects invalid formats                          │
│  └── Use cases: with in-memory doubles for all outbound ports          │
│      - CreateDonationIntentUseCase returns existing for duplicate key   │
│      - LoginUserUseCase increments failed attempts on wrong password    │
│                                                                         │
│  Integration Tests (testcontainers for PG + Redis):                    │
│  ├── Repository adapters: CRUD + query correctness                     │
│  ├── Cache adapter: TTL, invalidation                                  │
│  └── Transaction manager: rollback on failure                          │
│                                                                         │
│  E2E / API Tests (supertest against running Fastify):                  │
│  ├── Full request lifecycle: register → login → create donation        │
│  ├── RBAC enforcement: staff can't assign SUPER_ADMIN                  │
│  ├── Webhook idempotency: same event ID returns 409 on second call     │
│  └── Rate limiting: returns 429 after threshold                        │
│                                                                         │
│  Tools:                                                                │
│  ├── Test runner:      Vitest                                          │
│  ├── Containers:       @testcontainers/postgresql, generic (Redis)     │
│  ├── HTTP testing:     light-my-request (Fastify built-in)             │
│  ├── Mocks/Stubs:      In-memory implementations of outbound ports     │
│  └── Fixtures:         Factory functions per domain entity             │
│                                                                         │
│  Coverage targets:                                                     │
│  ├── Domain layer:     95%+                                            │
│  ├── Application layer: 90%+                                           │
│  ├── Infrastructure:   80%+ (adapters)                                 │
│  └── E2E:              Critical paths only                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Testing Port/Adapter Pattern

```typescript
// In-memory double for unit testing use cases:
class InMemoryDonationRepository implements DonationRepository {
  private store = new Map<string, Donation>();

  async save(donation: Donation): Promise<void> {
    this.store.set(donation.id.value, donation);
  }

  async findById(id: UniqueId): Promise<Donation | null> {
    return this.store.get(id.value) ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<Donation | null> {
    for (const d of this.store.values()) {
      if (d.idempotencyKey === key) return d;
    }
    return null;
  }

  // ... remaining methods
}

// Usage in test:
describe("CreateDonationIntentUseCase", () => {
  it("returns existing donation for duplicate idempotency key", async () => {
    const repo = new InMemoryDonationRepository();
    const gateway = new StubPaymentGateway();
    const useCase = new CreateDonationIntentUseCase(repo, gateway);

    const input = { ..., idempotencyKey: "abc-123" };
    const first = await useCase.execute(input);
    const second = await useCase.execute(input);

    expect(second.donationId).toBe(first.donationId);
  });
});
```

---

## Recommended Package Choices

```
Runtime & Framework:
  fastify              — HTTP server (faster than Express, schema-first)
  @fastify/cors        — CORS
  @fastify/helmet      — Security headers
  @fastify/rate-limit  — Rate limiting (Redis-backed)
  @fastify/compress    — gzip compression

Validation:
  zod                  — Runtime schema validation

Database:
  pg                   — PostgreSQL driver
  node-pg-migrate      — SQL migrations (no ORM)

Cache & Queues:
  ioredis              — Redis client
  bullmq               — Job queue (Redis-backed)

Auth:
  jsonwebtoken         — JWT creation/verification
  bcryptjs             — Password hashing

External Services:
  stripe               — Payment processing
  @sendgrid/mail       — Email
  twilio               — SMS (optional)
  @aws-sdk/client-s3   — Object storage

DI:
  tsyringe             — Lightweight dependency injection

Logging:
  pino                 — Structured JSON logging (Fastify default)

Testing:
  vitest               — Test runner
  @testcontainers/*    — Container-based integration tests

Dev:
  tsx                  — TypeScript execution
  typescript           — Compiler
```
