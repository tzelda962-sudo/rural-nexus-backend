import type { IVolunteerRepository } from '@domain/repositories/IVolunteerRepository';
import type { Volunteer, VolunteerApplication } from '@domain/entities/Volunteer';

/**
 * Application Use Case: SubmitVolunteerUseCase
 *
 * Orchestrates the volunteer application submission flow.
 * Business rules:
 *  - Email must include '@' (basic gate — richer validation is at the form layer).
 *  - All required fields must be non-empty strings.
 */
export class SubmitVolunteerUseCase {
  constructor(private readonly repo: IVolunteerRepository) {}

  async execute(application: VolunteerApplication): Promise<Volunteer> {
    // Business rule: basic email sanity check
    if (!application.email.includes('@')) {
      throw new Error('A valid email address is required.');
    }

    // Business rule: required fields must not be blank
    const required: (keyof VolunteerApplication)[] = [
      'firstName',
      'lastName',
      'email',
      'areaOfInterest',
    ];
    for (const field of required) {
      if (!application[field]?.trim()) {
        throw new Error(`Field "${String(field)}" is required.`);
      }
    }

    return this.repo.submit(application);
  }
}
