# Phase 5 — Donor & Beneficiary Management (Extended)

## Donor Module — Domain
- [x] `entities/DonorProfile.ts` (aggregate — recordDonation/recalculateTier/setAnonymous)
- [x] `entities/TaxReceipt.ts` (entity — create/attachFile, validates year + donations)
- [x] `value-objects/DonorTier.ts` (BRONZE/SILVER/GOLD/PATRON with cent thresholds)
- [x] `value-objects/CommunicationPreferences.ts`
- [x] `ports/inbound/GetDonorProfile.ts`
- [x] `ports/inbound/UpdateCommunicationPreferences.ts`
- [x] `ports/outbound/DonorRepository.ts`
- [x] `ports/outbound/TaxReceiptRepository.ts`

## Donor Module — Application
- [x] `use-cases/GetDonorProfileUseCase.ts`
- [x] `use-cases/UpdateCommunicationPreferencesUseCase.ts`
- [ ] `use-cases/IssueTaxReceiptUseCase.ts` (deferred — requires PDF generation)

## Donor Module — Infrastructure
- [x] `adapters/http/donor.routes.ts` (GET /donor/profile, PUT /donor/preferences)
- [x] `adapters/persistence/PgDonorRepository.ts`
- [x] `donor.module.ts`
- [x] Subscribe to `DonationCompleted` → upsert donor profile, record donation, recalculate tier

## Beneficiary Module — Domain
- [x] `entities/Beneficiary.ts` (enroll/assignToProgram/graduate/deactivate)
- [x] `entities/Program.ts` (create/activate/complete/enrollOne + capacity enforcement)
- [x] `value-objects/BeneficiaryStatus.ts` (ACTIVE | GRADUATED | INACTIVE)
- [x] `value-objects/ProgramStatus.ts` (ACTIVE | COMPLETED | PLANNED)
- [x] `ports/inbound/EnrollBeneficiary.ts`
- [x] `ports/inbound/CreateProgram.ts`
- [x] `ports/inbound/AssignBeneficiaryToProgram.ts`
- [x] `ports/outbound/BeneficiaryRepository.ts`
- [x] `ports/outbound/ProgramRepository.ts`

## Beneficiary Module — Application
- [x] `use-cases/EnrollBeneficiaryUseCase.ts`
- [x] `use-cases/CreateProgramUseCase.ts`
- [x] `use-cases/AssignBeneficiaryToProgramUseCase.ts`
- [x] `use-cases/ListProgramsUseCase.ts`

## Beneficiary Module — Infrastructure
- [x] `adapters/http/beneficiary.routes.ts` (CRUD beneficiaries, programs, assign)
- [x] `adapters/persistence/PgBeneficiaryRepository.ts` (program_ids subquery, status/program filters)
- [x] `adapters/persistence/PgProgramRepository.ts`
- [x] `beneficiary.module.ts`

## SQL Migration
- [x] `0007_donors_beneficiaries.sql`: `donor_profiles`, `beneficiaries`, `programs`, `beneficiary_programs`

## Composition
- [x] Wire `donor.module` and `beneficiary.module` into `src/main.ts`

## Tests
- [x] Unit: DonorProfile (9 tests — create, tier thresholds at BRONZE/SILVER/GOLD/PATRON, accumulation, prefs, anonymous, rehydrate)
- [x] Unit: Program + Beneficiary (15 tests — create/validate, activate/complete, enrollOne capacity, enroll beneficiary, assign idempotent, graduate/deactivate)
- [ ] E2E: donor profile updated after DonationCompleted (deferred — needs running server)
